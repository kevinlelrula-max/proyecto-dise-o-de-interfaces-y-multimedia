import { useEffect, useState, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { getDashboard } from "../../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
const fmtN  = (n) => new Intl.NumberFormat("es-CO").format(n);
const token = () => localStorage.getItem("token");

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

function getFechaHoy() {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Hook count-up ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 900, format = "num") {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, subLabel, icon, gradient, delay = 0, format = "num", alert = false }) {
  const displayVal = useCountUp(value, 900);
  return (
    <div style={{
      ...s.kpiCard,
      animation: `cardIn 0.45s ease ${delay}ms both`,
      borderTop: `3px solid ${gradient[0]}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", flexShrink: 0,
        }}>
          {icon}
        </div>
        {alert && value > 0 && (
          <span style={{
            fontSize: "10px", fontWeight: "700", color: "#ef4444",
            background: "#fef2f2", padding: "3px 8px", borderRadius: "999px",
            border: "1px solid #fecaca",
          }}>
            ● Alerta
          </span>
        )}
      </div>
      <div style={s.kpiValue}>
        {format === "currency" ? fmt(displayVal) : fmtN(displayVal)}
      </div>
      <div style={s.kpiLabel}>{label}</div>
      {subLabel && <div style={s.kpiSub}>{subLabel}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = "100%", r = "10px" }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Badge de estado ───────────────────────────────────────────────────────────
const ESTADO_META = {
  pendiente:       { label: "Pendiente",       color: "#92400e", bg: "#fef3c7" },
  "en preparacion":{ label: "En preparación",  color: "#1e40af", bg: "#dbeafe" },
  enviado:         { label: "Enviado",          color: "#065f46", bg: "#d1fae5" },
  entregado:       { label: "Entregado",        color: "#3730a3", bg: "#e0e7ff" },
  cancelado:       { label: "Cancelado",        color: "#991b1b", bg: "#fee2e2" },
};

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0B1628", borderRadius: "10px", padding: "8px 14px",
      color: "#fff", fontSize: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}>
      <p style={{ color: "#94a3b8", marginBottom: "3px", fontSize: "11px" }}>{label}</p>
      <p style={{ fontWeight: "700", color: "#00C9A7" }}>{fmt(payload[0].value)}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Inicio({ onNavegar, usuario = "Usuario" }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard(token()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  // Rellena días faltantes en el sparkline para que siempre haya 7 barras
  const spark = (() => {
    if (!data?.spark) return [];
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const found = data.spark.find(s => s.dia?.slice(0, 10) === key);
      dias.push({
        dia: d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }),
        total: found ? Number(found.total) : 0,
      });
    }
    return dias;
  })();

  const crecimiento = (() => {
    if (!data) return null;
    if (data.mes_anterior === 0) return data.mes_actual > 0 ? 100 : 0;
    return Math.round(((data.mes_actual - data.mes_anterior) / data.mes_anterior) * 100);
  })();

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .quick-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important;
        }
        .act-row:hover {
          background: #f8fafc !important;
        }
      `}</style>

      <div style={s.page}>

        {/* ── ENCABEZADO ─────────────────────────────────────────────────── */}
        <div style={{ ...s.header, animation: "cardIn 0.4s ease 0ms both" }}>
          <div>
            <h1 style={s.saludo}>{getSaludo()}, <span style={{ color: "#3674B5" }}>{usuario}</span> 👋</h1>
            <p style={s.fecha}>{getFechaHoy()}</p>
          </div>
          <button
            style={s.refreshBtn}
            onClick={() => { setLoading(true); getDashboard(token()).then(d => { setData(d); setLoading(false); }); }}
            title="Actualizar métricas"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <div style={s.kpiRow}>
          {loading ? (
            <>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ ...s.kpiCard, padding: "20px" }}>
                  <Skeleton w="40px" h="40px" r="12px" />
                  <div style={{ marginTop: "14px" }}><Skeleton w="60%" h="28px" r="6px" /></div>
                  <div style={{ marginTop: "8px" }}><Skeleton w="80%" h="14px" r="4px" /></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <KpiCard
                label="Ventas hoy"
                value={data?.ventas_hoy ?? 0}
                subLabel="POS + tienda online"
                icon="🧾"
                gradient={["#00C9A7", "#00B4D8"]}
                delay={50}
              />
              <KpiCard
                label="Ingresos hoy"
                value={data?.ingresos_hoy ?? 0}
                format="currency"
                subLabel={crecimiento !== null ? `${crecimiento >= 0 ? "+" : ""}${crecimiento}% vs mes anterior` : ""}
                icon="💰"
                gradient={["#0F6E56", "#22c55e"]}
                delay={120}
              />
              <KpiCard
                label="Pedidos pendientes"
                value={data?.pedidos_pendientes ?? 0}
                subLabel="Tienda online"
                icon="📦"
                gradient={["#f59e0b", "#fb923c"]}
                delay={190}
                alert={true}
              />
              <KpiCard
                label="Alertas de stock"
                value={(data?.sin_stock ?? 0) + (data?.stock_bajo ?? 0)}
                subLabel={`${data?.sin_stock ?? 0} sin stock · ${data?.stock_bajo ?? 0} bajo`}
                icon="⚠️"
                gradient={["#ef4444", "#f43f5e"]}
                delay={260}
                alert={true}
              />
            </>
          )}
        </div>

        {/* ── FILA CENTRAL ────────────────────────────────────────────────── */}
        <div style={s.midRow}>

          {/* SPARKLINE */}
          <div style={{ ...s.card, flex: 2, animation: "cardIn 0.45s ease 320ms both" }}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={s.cardTitle}>Ventas — últimos 7 días</h3>
                <p style={s.cardSub}>POS + tienda online combinados</p>
              </div>
              {data && (
                <span style={{
                  fontSize: "13px", fontWeight: "700",
                  color: crecimiento >= 0 ? "#3674B5" : "#ef4444",
                  background: crecimiento >= 0 ? "#EEF4FF" : "#fef2f2",
                  padding: "4px 10px", borderRadius: "999px",
                }}>
                  {crecimiento >= 0 ? "▲" : "▼"} {Math.abs(crecimiento)}% este mes
                </span>
              )}
            </div>

            {loading ? (
              <Skeleton w="100%" h="160px" r="10px" />
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={spark} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradInicio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#00C9A7" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#00C9A7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<DarkTooltip />} />
                  <Area
                    type="monotone" dataKey="total"
                    stroke="#00C9A7" strokeWidth={2.5}
                    fill="url(#gradInicio)" dot={false}
                    activeDot={{ r: 5, fill: "#00C9A7", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div style={{ ...s.card, flex: 1.2, animation: "cardIn 0.45s ease 380ms both" }}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={s.cardTitle}>Pedidos recientes</h3>
                <p style={s.cardSub}>Últimos 5 pedidos online</p>
              </div>
              <button
                style={s.verTodosBtn}
                onClick={() => onNavegar?.("pedidos")}
              >
                Ver todos →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
                    <Skeleton w="34px" h="34px" r="9px" />
                    <div style={{ flex: 1 }}>
                      <Skeleton w="70%" h="12px" r="4px" />
                      <div style={{ marginTop: "5px" }}><Skeleton w="50%" h="10px" r="4px" /></div>
                    </div>
                  </div>
                ))
              ) : data?.recientes?.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>📭</span>
                  Sin pedidos recientes
                </div>
              ) : (
                data?.recientes?.map((p, i) => {
                  const meta = ESTADO_META[p.estado] || ESTADO_META["pendiente"];
                  const inicial = (p.cliente || "?")[0].toUpperCase();
                  return (
                    <div
                      key={p.id}
                      className="act-row"
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "9px 10px", borderRadius: "10px", cursor: "pointer",
                        transition: "background 0.15s",
                        animation: `fadeSlide 0.3s ease ${i * 60}ms both`,
                      }}
                      onClick={() => onNavegar?.("pedidos")}
                    >
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "9px",
                        background: "linear-gradient(135deg, #00C9A7, #0099FF)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0,
                      }}>
                        {inicial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.cliente}
                        </p>
                        <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
                          {new Date(p.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{fmt(p.total)}</p>
                        <span style={{
                          fontSize: "10px", fontWeight: "600", padding: "2px 7px",
                          borderRadius: "999px", backgroundColor: meta.bg, color: meta.color,
                          marginTop: "2px", display: "inline-block",
                        }}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── ACCESOS RÁPIDOS ──────────────────────────────────────────────── */}
        <div style={{ animation: "cardIn 0.45s ease 440ms both" }}>
          <h3 style={{ ...s.cardTitle, marginBottom: "14px" }}>Accesos rápidos</h3>
          <div style={s.quickRow}>
            {[
              { key: "pos",      icon: "💻", label: "Punto de venta",  desc: "Registrar venta",       gradient: ["#0F6E56", "#22c55e"] },
              { key: "pedidos",  icon: "📦", label: "Pedidos online",   desc: "Ver kanban",             gradient: ["#f59e0b", "#fb923c"] },
              { key: "productos",icon: "🐟", label: "Productos",        desc: "Gestionar inventario",   gradient: ["#2563eb", "#7c3aed"] },
              { key: "reportes", icon: "📊", label: "Reportes",         desc: "Análisis y métricas",    gradient: ["#0e7490", "#0284c7"] },
              { key: "clientes", icon: "👥", label: "Clientes",         desc: "Base de datos",          gradient: ["#7c3aed", "#db2777"] },
              { key: "mensajes", icon: "✉️", label: "Mensajes",          desc: "Bandeja de entrada",     gradient: ["#dc2626", "#ea580c"] },
            ].map((item, i) => (
              <button
                key={item.key}
                className="quick-card"
                onClick={() => onNavegar?.(item.key)}
                style={{
                  ...s.quickCard,
                  animation: `cardIn 0.4s ease ${460 + i * 55}ms both`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "13px",
                  background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", marginBottom: "10px",
                }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "3px" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: "11px", color: "#94a3b8" }}>{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    background: "transparent",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  saludo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.03em",
  },
  fecha: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "4px",
    textTransform: "capitalize",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 16px",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
  },

  // KPI
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    border: "1px solid #e8edf2",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  kpiValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.04em",
    lineHeight: 1.2,
    marginTop: "10px",
  },
  kpiLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  kpiSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "3px",
  },

  // Mid row
  midRow: {
    display: "flex",
    gap: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    border: "1px solid #e8edf2",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  cardSub: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "3px",
  },
  verTodosBtn: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#3674B5",
    background: "#EEF4FF",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // Quick access
  quickRow: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "12px",
  },
  quickCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px 14px",
    border: "1px solid #e8edf2",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};
