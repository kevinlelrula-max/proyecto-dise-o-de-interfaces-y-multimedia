import { useEffect, useState, useRef } from "react";
import { getReporteProductos, getReporteResumen } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

// ── Paleta ──────────────────────────────────────────────────────────────────
const COLORS = ["#3674B5", "#1e40af", "#60a5fa", "#0e7490", "#7c3aed", "#93c5fd"];

// ── Formatters ───────────────────────────────────────────────────────────────
const fmt    = n => Number(n).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const fmtNum = n => Number(n).toLocaleString("es-CO");
const fmtDay = iso => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

// ── Períodos predefinidos ────────────────────────────────────────────────────
function getPeriodo(clave) {
  const hoy   = new Date();
  const hasta = hoy.toISOString().slice(0, 10);
  const d = (dias) => {
    const f = new Date(hoy); f.setDate(f.getDate() - dias);
    return f.toISOString().slice(0, 10);
  };
  const primerDiaMes = () => {
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return f.toISOString().slice(0, 10);
  };
  const primerDiaAnio = () => {
    const f = new Date(hoy.getFullYear(), 0, 1);
    return f.toISOString().slice(0, 10);
  };
  return {
    semana:   { desde: d(6),           hasta },
    mes:      { desde: primerDiaMes(), hasta },
    trimestre:{ desde: d(89),          hasta },
    anio:     { desde: primerDiaAnio(),hasta },
    todo:     { desde: null,           hasta: null },
  }[clave] || { desde: null, hasta: null };
}

// ── Contador animado ─────────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    cancelAnimationFrame(ref.current);
    ref.current = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * ease));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
}

// ── KPI con contador animado ─────────────────────────────────────────────────
function KpiCard({ label, rawValue, display, icon, color, bg, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      ...s.kpiCard,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      <div style={{ ...s.kpiIcon, backgroundColor: bg, color }}>{icon}</div>
      <div style={s.kpiInfo}>
        <span style={s.kpiLabel}>{label}</span>
        <span style={{ ...s.kpiValue, color }}>{display}</span>
      </div>
    </div>
  );
}

// ── Tooltip oscuro ───────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label, moneda }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tt.wrap}>
      <p style={tt.label}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ ...tt.val, color: p.color || "#fff" }}>
          {moneda ? fmt(p.value) : `${fmtNum(p.value)} kg`}
        </p>
      ))}
    </div>
  );
}
const tt = {
  wrap:  { background: "#0B1628", borderRadius: "10px", padding: "10px 14px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  label: { fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" },
  val:   { fontSize: "14px", fontWeight: "700" },
};

// ── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ h = 20, w = "100%", r = 8, mb = 0 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r, marginBottom: mb,
      background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Reportes() {
  const token = localStorage.getItem("token");

  const [tab,       setTab]       = useState("resumen");
  const [periodo,   setPeriodo]   = useState("mes");
  const [resumen,   setResumen]   = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [animTab,   setAnimTab]   = useState(true);

  // Periodo activo
  const { desde, hasta } = getPeriodo(periodo);

  const cargar = async () => {
    setCargando(true);
    const [res, prods] = await Promise.all([
      getReporteResumen(token, { desde, hasta }),
      getReporteProductos(token, { desde, hasta }),
    ]);
    setResumen(res);
    setProductos((prods || []).map(p => ({
      ...p,
      total_vendido:  Number(p.total_vendido),
      total_ingresos: Number(p.total_ingresos),
    })));
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [periodo]);

  const cambiarTab = (t) => {
    setAnimTab(false);
    setTimeout(() => { setTab(t); setAnimTab(true); }, 120);
  };

  // Datos derivados
  const kpis        = resumen?.kpis || {};
  const ventasDia   = (resumen?.ventasPorDia || []).map(v => ({ ...v, total: Number(v.total), dia: fmtDay(v.dia) }));
  const topClientes = resumen?.clientes || [];
  const totalIngresos = productos.reduce((a, p) => a + p.total_ingresos, 0);
  const topProducto   = productos[0];

  const PERIODOS = [
    { key: "semana",    label: "Esta semana" },
    { key: "mes",       label: "Este mes" },
    { key: "trimestre", label: "Últimos 3 meses" },
    { key: "anio",      label: "Este año" },
    { key: "todo",      label: "Todo" },
  ];

  const TABS = [
    { key: "resumen",   label: "📊 Resumen" },
    { key: "ventas",    label: "📈 Ventas por día" },
    { key: "productos", label: "🐟 Productos" },
    { key: "clientes",  label: "👥 Clientes" },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rep-tab-content {
          animation: fadeUp 0.25s ease;
        }
      `}</style>

      <div style={s.page}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <h2 style={s.headerTitle}>Reportes</h2>
            <p style={s.headerSub}>Análisis de desempeño · toma de decisiones basada en datos</p>
          </div>

          {/* Selector de período — elemento interactivo principal */}
          <div style={s.periodoWrap}>
            {PERIODOS.map(p => (
              <button
                key={p.key}
                style={{ ...s.periodoBtn, ...(periodo === p.key ? s.periodoBtnActive : {}) }}
                onClick={() => setPeriodo(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        {cargando ? (
          <div style={s.kpiRow}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ ...s.kpiCard, flexDirection: "column", gap: "10px" }}>
                <Skeleton h={16} w="60%" />
                <Skeleton h={28} w="80%" />
              </div>
            ))}
          </div>
        ) : (
          <div style={s.kpiRow}>
            <KpiCard delay={0}   label="Ingresos totales"   display={fmt(kpis.ingresos || 0)}           icon="💰" color="#3674B5" bg="#EEF4FF" />
            <KpiCard delay={80}  label="Ventas realizadas"  display={fmtNum(kpis.ventas || 0)}           icon="🧾" color="#1e40af" bg="#eff6ff" />
            <KpiCard delay={160} label="Ticket promedio"    display={fmt(kpis.promedio || 0)}            icon="📈" color="#7c3aed" bg="#f5f3ff" />
            <KpiCard delay={240} label="Producto estrella"  display={topProducto?.nombre || "Sin datos"} icon="⭐" color="#b45309" bg="#fffbeb" />
          </div>
        )}

        {/* ── TABS ── */}
        <div style={s.tabBar}>
          {TABS.map(t => (
            <button
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => cambiarTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── CONTENIDO CON ANIMACIÓN ── */}
        {cargando ? (
          <div style={s.grid2}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={s.card}>
                <Skeleton h={18} w="40%" mb={8} />
                <Skeleton h={12} w="60%" mb={24} />
                <Skeleton h={220} />
              </div>
            ))}
          </div>
        ) : (
          <div key={tab} className="rep-tab-content">

            {/* ── RESUMEN ── */}
            {tab === "resumen" && (
              <div style={s.grid2}>

                <div style={s.card}>
                  <CardHeader title="Ingresos por día" sub="Evolución en el período seleccionado" />
                  {ventasDia.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={ventasDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3674B5" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3674B5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<DarkTooltip moneda />} />
                        <Area type="monotone" dataKey="total" stroke="#3674B5" strokeWidth={2} fill="url(#gArea)" isAnimationActive animationDuration={800} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={s.card}>
                  <CardHeader title="Top productos" sub="Por kilogramos vendidos" />
                  {productos.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={productos.slice(0, 5)} margin={{ top: 8, right: 8, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="total_vendido" name="cantidad" radius={[6,6,0,0]} isAnimationActive animationDuration={700} animationBegin={100}>
                          {productos.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={s.card}>
                  <CardHeader title="Clientes más activos" sub="Por número de compras" />
                  {topClientes.length === 0 ? <Empty texto="Sin datos de clientes" /> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                      {topClientes.map((c, i) => {
                        const pct = ((c.compras / topClientes[0].compras) * 100).toFixed(0);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ ...s.rankNum, backgroundColor: i === 0 ? "#fef9c3" : "#f1f5f9", color: i === 0 ? "#854d0e" : "#64748b" }}>
                              {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</span>
                                <span style={{ fontSize: "12px", color: "#64748b", flexShrink: 0, marginLeft: "8px" }}>{c.compras} compras</span>
                              </div>
                              <div style={{ height: "5px", borderRadius: "999px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: "999px", backgroundColor: "#3674B5",
                                  width: "0%", animation: `barGrow 0.7s ease ${i * 100}ms forwards`,
                                  // @keyframes inline via CSS animation
                                }}>
                                  <style>{`@keyframes barGrow { to { width: ${pct}%; } }`}</style>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={s.card}>
                  <CardHeader title="Ingresos por producto" sub="Participación en el período" />
                  {productos.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={productos.slice(0, 6)} dataKey="total_ingresos" nameKey="nombre"
                          cx="50%" cy="45%" outerRadius={85} innerRadius={40}
                          isAnimationActive animationDuration={800} animationBegin={200}>
                          {productos.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<DarkTooltip moneda />} />
                        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>
            )}

            {/* ── VENTAS POR DÍA ── */}
            {tab === "ventas" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={s.miniKpiRow}>
                  {[
                    { label: "Ingresos del período",  value: fmt(kpis.ingresos || 0) },
                    { label: "Total ventas",           value: fmtNum(kpis.ventas || 0) },
                    { label: "Ticket promedio",        value: fmt(kpis.promedio || 0) },
                    { label: "Días con actividad",     value: ventasDia.length },
                  ].map((m, i) => (
                    <div key={i} style={{ ...s.miniKpi, animation: `fadeUp 0.3s ease ${i * 60}ms both` }}>
                      <span style={s.miniLabel}>{m.label}</span>
                      <span style={s.miniValue}>{m.value}</span>
                    </div>
                  ))}
                </div>

                <div style={s.card}>
                  <CardHeader title="Evolución de ingresos diarios" sub="Ingresos acumulados día a día en el período" />
                  {ventasDia.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={ventasDia} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gArea2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3674B5" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="#3674B5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<DarkTooltip moneda />} />
                        <Area type="monotone" dataKey="total" name="Ingresos" stroke="#3674B5" strokeWidth={2.5}
                          fill="url(#gArea2)" dot={{ r: 3, fill: "#3674B5" }}
                          isAnimationActive animationDuration={900} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={s.card}>
                  <CardHeader title="Detalle por día" />
                  <TablaVentas ventasDia={ventasDia} />
                </div>
              </div>
            )}

            {/* ── PRODUCTOS ── */}
            {tab === "productos" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={s.grid2}>
                  <div style={s.card}>
                    <CardHeader title="Kilogramos vendidos" sub="Por producto en el período" />
                    {productos.length === 0 ? <Empty /> : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={productos} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Tooltip content={<DarkTooltip />} />
                          <Bar dataKey="total_vendido" name="cantidad" radius={[6,6,0,0]} isAnimationActive animationDuration={700}>
                            {productos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div style={s.card}>
                    <CardHeader title="Ingresos por producto" sub="Distribución de ingresos" />
                    {productos.length === 0 ? <Empty /> : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={productos} dataKey="total_ingresos" nameKey="nombre"
                            cx="50%" cy="44%" outerRadius={100} innerRadius={48}
                            isAnimationActive animationDuration={800} animationBegin={100}>
                            {productos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<DarkTooltip moneda />} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div style={s.card}>
                  <CardHeader title="Ranking de productos" sub="Ordenado por kilogramos vendidos" />
                  <TablaProductos productos={productos} totalIngresos={totalIngresos} />
                </div>
              </div>
            )}

            {/* ── CLIENTES ── */}
            {tab === "clientes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={s.card}>
                  <CardHeader title="Clientes más activos" sub="Basado en compras registradas en el período" />
                  {topClientes.length === 0 ? <Empty texto="No hay datos de clientes en este período" /> : (
                    <>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={topClientes} layout="vertical"
                          margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12, fill: "#334155" }} width={130} />
                          <Tooltip content={<DarkTooltip />} />
                          <Bar dataKey="compras" name="compras" radius={[0,6,6,0]} fill="#3674B5"
                            isAnimationActive animationDuration={700} />
                        </BarChart>
                      </ResponsiveContainer>

                      <table style={{ ...s.table, marginTop: "24px" }}>
                        <thead>
                          <tr>
                            <th style={s.th}>#</th>
                            <th style={s.th}>Cliente</th>
                            <th style={s.th}>Compras</th>
                            <th style={s.th}>Nivel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topClientes.map((c, i) => {
                            const max   = topClientes[0].compras;
                            const nivel = c.compras >= max * 0.8
                              ? { label: "⭐ VIP",       color: "#854d0e", bg: "#fef9c3" }
                              : c.compras >= max * 0.5
                              ? { label: "🔵 Frecuente", color: "#1e40af", bg: "#eff6ff" }
                              : { label: "🔵 Regular",   color: "#3674B5", bg: "#EEF4FF" };
                            return (
                              <tr key={i} style={s.tr}>
                                <td style={s.tdRank}>
                                  <span style={{ ...s.rankNum, backgroundColor: i === 0 ? "#fef9c3" : "#f1f5f9", color: i === 0 ? "#854d0e" : "#64748b" }}>{i + 1}</span>
                                </td>
                                <td style={{ ...s.td, fontWeight: "600", color: "#0f172a" }}>{c.nombre}</td>
                                <td style={s.td}>{c.compras} compras</td>
                                <td style={s.td}>
                                  <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", backgroundColor: nivel.bg, color: nivel.color }}>
                                    {nivel.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>

                <div style={s.insightCard}>
                  <span style={{ fontSize: "22px", flexShrink: 0 }}>💡</span>
                  <div>
                    <p style={s.insightTitle}>¿Cómo usar este reporte?</p>
                    <p style={s.insightText}>
                      Identifica a tus clientes <strong>VIP</strong> y contáctalos con ofertas exclusivas.
                      Los <strong>Frecuentes</strong> responden bien a descuentos por volumen.
                      Cambia el período para ver qué clientes fueron más activos en épocas específicas y planifica tu estrategia de fidelización.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────
function CardHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0B1628", margin: "0 0 3px" }}>{title}</h3>
      {sub && <span style={{ fontSize: "12px", color: "#94a3b8" }}>{sub}</span>}
    </div>
  );
}

function Empty({ texto = "Sin datos en el período seleccionado" }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: "13px" }}>
      <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📭</span>
      {texto}
    </div>
  );
}

function TablaVentas({ ventasDia }) {
  const total = ventasDia.reduce((a, v) => a + v.total, 0);
  if (!ventasDia.length) return <Empty />;
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Día</th>
          <th style={s.th}>Ingresos</th>
          <th style={s.th}>Participación</th>
        </tr>
      </thead>
      <tbody>
        {[...ventasDia].reverse().map((v, i) => {
          const pct = total > 0 ? ((v.total / total) * 100).toFixed(1) : 0;
          return (
            <tr key={i} style={s.tr}>
              <td style={s.td}>{v.dia}</td>
              <td style={{ ...s.td, fontWeight: "700", color: "#3674B5" }}>{
                Number(v.total).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
              }</td>
              <td style={s.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ height: "6px", borderRadius: "999px", backgroundColor: "#f1f5f9", flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#3674B5", borderRadius: "999px" }} />
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TablaProductos({ productos, totalIngresos }) {
  const COLORS = ["#3674B5", "#1e40af", "#60a5fa", "#0e7490", "#7c3aed", "#93c5fd"];
  if (!productos.length) return <Empty />;
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>#</th>
          <th style={s.th}>Producto</th>
          <th style={s.th}>Kg vendidos</th>
          <th style={s.th}>Ingresos</th>
          <th style={s.th}>Precio prom. / kg</th>
          <th style={s.th}>Participación</th>
        </tr>
      </thead>
      <tbody>
        {[...productos].sort((a, b) => b.total_vendido - a.total_vendido).map((p, i) => {
          const pct      = totalIngresos > 0 ? ((p.total_ingresos / totalIngresos) * 100).toFixed(1) : 0;
          const promKg   = p.total_vendido > 0
            ? Number(p.total_ingresos / p.total_vendido).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
            : "—";
          return (
            <tr key={i} style={s.tr}>
              <td style={s.tdRank}>
                <span style={{ ...s.rankNum, backgroundColor: i === 0 ? "#fef9c3" : i === 1 ? "#f1f5f9" : "#f8fafc", color: i === 0 ? "#854d0e" : "#64748b" }}>{i + 1}</span>
              </td>
              <td style={s.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontWeight: "600", color: "#0f172a" }}>{p.nombre}</span>
                </div>
              </td>
              <td style={s.td}>{Number(p.total_vendido).toLocaleString("es-CO")} kg</td>
              <td style={{ ...s.td, fontWeight: "700", color: "#3674B5" }}>
                {Number(p.total_ingresos).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
              </td>
              <td style={s.td}>{promKg}</td>
              <td style={s.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ height: "6px", borderRadius: "999px", backgroundColor: "#f1f5f9", flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length], borderRadius: "999px" }} />
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "28px", display: "flex", flexDirection: "column", gap: "20px" },

  header:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0B1628", margin: 0, letterSpacing: "-0.02em" },
  headerSub:   { fontSize: "13px", color: "#64748b", marginTop: "4px" },

  // Selector período
  periodoWrap:      { display: "flex", gap: "4px", flexWrap: "wrap" },
  periodoBtn:       { padding: "6px 13px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", fontSize: "12px", fontWeight: "500", color: "#64748b", cursor: "pointer", transition: "all 0.15s" },
  periodoBtnActive: { backgroundColor: "#3674B5", borderColor: "#3674B5", color: "white", fontWeight: "700" },

  // KPI row
  kpiRow:  { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  kpiCard: { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "14px" },
  kpiIcon: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  kpiInfo: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
  kpiLabel:{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
  kpiValue:{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  // Tabs
  tabBar:    { display: "flex", gap: "4px", borderBottom: "1px solid #e2e8f0" },
  tab:       { padding: "9px 18px", background: "none", border: "none", borderRadius: "8px 8px 0 0", fontSize: "13px", fontWeight: "500", color: "#64748b", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: "-1px", transition: "color 0.15s" },
  tabActive: { color: "#3674B5", borderBottom: "2px solid #3674B5", fontWeight: "700" },

  // Cards
  card:    { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  grid2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },

  // Mini KPIs (tab ventas)
  miniKpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  miniKpi:    { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" },
  miniLabel:  { fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
  miniValue:  { fontSize: "18px", fontWeight: "800", color: "#3674B5", letterSpacing: "-0.02em" },

  // Tabla
  table:  { width: "100%", borderCollapse: "collapse" },
  th:     { padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  tr:     { borderBottom: "1px solid #f1f5f9" },
  td:     { padding: "12px 12px", fontSize: "13px", color: "#334155" },
  tdRank: { padding: "12px 12px", width: "44px" },
  rankNum:{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },

  // Insight
  insightCard:  { backgroundColor: "#EEF4FF", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" },
  insightTitle: { fontSize: "14px", fontWeight: "700", color: "#1e40af", marginBottom: "6px" },
  insightText:  { fontSize: "13px", color: "#3674B5", lineHeight: "1.7" },
};
