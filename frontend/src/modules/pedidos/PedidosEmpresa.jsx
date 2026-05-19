import { useState, useEffect, useRef, useMemo } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Columnas de estado ────────────────────────────────────────────────────────
const COLUMNAS = [
  { key: "pendiente",       label: "Pendiente",       emoji: "🕐", color: "#92400e", bg: "#fffbeb", border: "#fde68a", light: "#fef9c3" },
  { key: "en preparacion",  label: "En preparación",  emoji: "👨‍🍳", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", light: "#dbeafe" },
  { key: "enviado",         label: "Enviado",          emoji: "🚚", color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", light: "#d1fae5" },
  { key: "entregado",       label: "Entregado",        emoji: "✅", color: "#3730a3", bg: "#eef2ff", border: "#c7d2fe", light: "#e0e7ff" },
  { key: "cancelado",       label: "Cancelado",        emoji: "❌", color: "#991b1b", bg: "#fff1f2", border: "#fecaca", light: "#fee2e2" },
];

const SIGUIENTE = {
  "pendiente":      "en preparacion",
  "en preparacion": "enviado",
  "enviado":        "entregado",
};

// ── Paleta de colores por cliente ─────────────────────────────────────────────
const CLIENTE_PALETTE = [
  { color: "#3674B5", bg: "#EEF4FF", border: "#bfdbfe" },
  { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  { color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
  { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  { color: "#2563a0", bg: "#e0effe", border: "#93c5fd" },
  { color: "#075985", bg: "#e0f2fe", border: "#7dd3fc" },
  { color: "#1e3a5f", bg: "#e8f0fb", border: "#c7d2fe" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt       = (p) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);
const fmtFecha  = (f) => f ? new Date(f).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtFechaL = (f) => f ? new Date(f).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const iniciales = (p) => {
  const n = p.cliente_nombre || p.cliente_usuario || "?";
  const a = p.cliente_apellido || "";
  return (n[0] + (a[0] || "")).toUpperCase();
};
const nombreCompleto = (p) =>
  p.cliente_nombre ? `${p.cliente_nombre} ${p.cliente_apellido || ""}`.trim() : p.cliente_usuario || "—";

function pagoOk(p) {
  return (p.metodo_pago || "").toLowerCase().includes("tarjeta") || p.estado !== "pendiente";
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PedidosEmpresa() {
  const token = localStorage.getItem("token");

  const [pedidos,      setPedidos]      = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [vista,        setVista]        = useState("kanban");
  const [busqueda,     setBusqueda]     = useState("");
  const [saliendo,     setSaliendo]     = useState({});
  const [clienteFiltro,setClienteFiltro]= useState(null); // id del cliente filtrado
  const [ultimaVez,    setUltimaVez]    = useState(null);
  const [segundosRest, setSegundosRest] = useState(30);
  const intervalRef = useRef(null);

  // ── Cargar pedidos ──────────────────────────────────────────────────────────
  const cargar = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/pedidos/empresa`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
      setUltimaVez(new Date());
      setSegundosRest(30);
    } catch { setPedidos([]); }
    finally  { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  // ── Auto-refresh cada 30 s ──────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSegundosRest(prev => {
        if (prev <= 1) { cargar(); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Color único por cliente ─────────────────────────────────────────────────
  const clienteColorMap = useMemo(() => {
    const map = {};
    const uniqueIds = [...new Set(pedidos.map(p => p.cliente_id).filter(Boolean))];
    uniqueIds.forEach((id, i) => { map[id] = CLIENTE_PALETTE[i % CLIENTE_PALETTE.length]; });
    return map;
  }, [pedidos]);

  // Clientes únicos activos (con pedidos no cancelados ni entregados)
  const clientesActivos = useMemo(() => {
    const vistos = new Set();
    return pedidos
      .filter(p => p.estado !== "cancelado" && p.estado !== "entregado")
      .filter(p => {
        if (vistos.has(p.cliente_id)) return false;
        vistos.add(p.cliente_id);
        return true;
      })
      .map(p => ({ id: p.cliente_id, nombre: nombreCompleto(p) }));
  }, [pedidos]);

  // ── Cambiar estado ──────────────────────────────────────────────────────────
  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    setSaliendo(prev => ({ ...prev, [pedidoId]: true }));
    await new Promise(r => setTimeout(r, 280));
    setActualizando(pedidoId);
    try {
      const res = await fetch(`${API}/api/pedidos/${pedidoId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
        if (seleccionado?.id === pedidoId) setSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
      }
    } finally {
      setActualizando(null);
      setSaliendo(prev => { const n = { ...prev }; delete n[pedidoId]; return n; });
    }
  };

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const pedidosFiltrados = pedidos.filter(p => {
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      if (!nombreCompleto(p).toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
    }
    return true;
  });

  const conteo = (key) => pedidos.filter(p => p.estado === key).length;
  const total  = pedidos.length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardSalir {
          from { opacity: 1; transform: scale(1); max-height: 200px; margin-bottom: 10px; }
          to   { opacity: 0; transform: scale(0.9); max-height: 0; margin-bottom: 0; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes chipIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kan-card { animation: cardEnter 0.25s ease both; transition: box-shadow 0.18s, transform 0.18s, opacity 0.2s; }
        .kan-card.saliendo { animation: cardSalir 0.28s ease forwards; overflow: hidden; }
        .kan-card:hover { box-shadow: 0 6px 24px rgba(54,116,181,0.14) !important; transform: translateY(-2px); }
        .kan-card.atenuado { opacity: 0.25; filter: saturate(0.3); transform: scale(0.98); }
        .kan-avanzar { transition: background 0.15s, transform 0.1s; }
        .kan-avanzar:hover { filter: brightness(1.1); transform: scale(1.03); }
        .kan-cancelar { transition: color 0.15s; }
        .kan-cancelar:hover { color: #dc2626 !important; }
        .cliente-chip { transition: all 0.15s; animation: chipIn 0.28s ease both; }
        .cliente-chip:hover { filter: brightness(0.95); transform: translateY(-1px); }
        .vista-btn { transition: all 0.15s; }
        .vista-btn:hover { background: #f1f5f9 !important; }
        .fila-lista:hover { background: #f8fafc !important; }
      `}</style>

      <div style={s.root}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Pedidos online</h2>
            <p style={s.subtitle}>{total} pedido{total !== 1 ? "s" : ""} · tienda en línea</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

            {/* Indicador live */}
            <div style={s.liveWrap}>
              <span style={s.liveDot} />
              <span style={s.liveTexto}>
                {ultimaVez
                  ? `Actualizado ${ultimaVez.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
                  : "Cargando…"}
              </span>
              <span style={s.liveCountdown}>{segundosRest}s</span>
            </div>

            <input
              style={s.buscador}
              placeholder="🔍  Buscar cliente o #pedido…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />

            {/* Toggle vista */}
            <div style={s.vistaTabs}>
              <button className="vista-btn" style={{ ...s.vistaBtn, ...(vista === "kanban" ? s.vistaBtnActive : {}) }}
                onClick={() => setVista("kanban")}>⬜ Kanban</button>
              <button className="vista-btn" style={{ ...s.vistaBtn, ...(vista === "lista" ? s.vistaBtnActive : {}) }}
                onClick={() => setVista("lista")}>☰ Lista</button>
            </div>

            <button style={s.refreshBtn} onClick={cargar} disabled={cargando} title="Actualizar ahora">
              {cargando ? "…" : "↻"}
            </button>
          </div>
        </div>

        {/* ── RESUMEN ── */}
        <div style={s.statsRow}>
          {COLUMNAS.slice(0, 4).map(col => (
            <div key={col.key} style={{ ...s.statCard, borderColor: conteo(col.key) > 0 ? col.border : "#e2e8f0" }}>
              <span style={{ fontSize: 22 }}>{col.emoji}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: conteo(col.key) > 0 ? col.color : "#cbd5e1", lineHeight: 1 }}>
                {conteo(col.key)}
              </span>
              <span style={s.statLabel}>{col.label}</span>
            </div>
          ))}
        </div>

        {/* ── CHIPS DE CLIENTE (solo si hay 2+ clientes activos) ── */}
        {clientesActivos.length >= 1 && (
          <div style={s.chipsWrap}>
            <span style={s.chipsLabel}>Filtrar por cliente:</span>
            <button
              className="cliente-chip"
              style={{
                ...s.chip,
                background: clienteFiltro === null ? "#0B1628" : "#f1f5f9",
                color:      clienteFiltro === null ? "white"   : "#64748b",
                border:     `1px solid ${clienteFiltro === null ? "#0B1628" : "#e2e8f0"}`,
              }}
              onClick={() => setClienteFiltro(null)}
            >
              Todos
            </button>
            {clientesActivos.map((c, i) => {
              const palette = clienteColorMap[c.id] || CLIENTE_PALETTE[0];
              const activo  = clienteFiltro === c.id;
              return (
                <button
                  key={c.id}
                  className="cliente-chip"
                  style={{
                    ...s.chip,
                    background: activo ? palette.color : palette.bg,
                    color:      activo ? "white"        : palette.color,
                    border:     `1px solid ${palette.border}`,
                    animationDelay: `${i * 50}ms`,
                  }}
                  onClick={() => setClienteFiltro(activo ? null : c.id)}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: activo ? "rgba(255,255,255,0.8)" : palette.color,
                    display: "inline-block", marginRight: 5, flexShrink: 0,
                  }} />
                  {c.nombre}
                </button>
              );
            })}
          </div>
        )}

        {cargando && <div style={s.empty}>Cargando pedidos…</div>}

        {/* ══ KANBAN ══ */}
        {!cargando && vista === "kanban" && (
          <div style={s.kanban}>
            {COLUMNAS.map(col => {
              const cards = pedidosFiltrados.filter(p => p.estado === col.key);
              return (
                <div key={col.key} style={s.columna}>
                  <div style={{ ...s.colHeader, borderBottom: `3px solid ${col.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{col.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</span>
                    </div>
                    <span style={{ ...s.colBadge, backgroundColor: col.light, color: col.color }}>
                      {cards.length}
                    </span>
                  </div>

                  <div style={s.colBody}>
                    {cards.length === 0 ? (
                      <div style={s.colEmpty}>Sin pedidos</div>
                    ) : cards.map(p => {
                      const palette  = clienteColorMap[p.cliente_id] || CLIENTE_PALETTE[0];
                      const atenuado = clienteFiltro !== null && clienteFiltro !== p.cliente_id;
                      return (
                        <div
                          key={p.id}
                          className={`kan-card${saliendo[p.id] ? " saliendo" : ""}${atenuado ? " atenuado" : ""}`}
                          style={{
                            ...s.card,
                            borderLeft: `3px solid ${palette.color}`,
                          }}
                          onClick={() => !atenuado && setSeleccionado(p)}
                        >
                          {/* Top */}
                          <div style={s.cardTop}>
                            <div style={{ ...s.avatar, backgroundColor: palette.bg, color: palette.color }}>
                              {iniciales(p)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={s.cardCliente}>{nombreCompleto(p)}</p>
                              <p style={s.cardId}>Pedido #{p.id}</p>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#0B1628" }}>
                              {fmt(p.total)}
                            </span>
                          </div>

                          {/* Meta */}
                          <div style={s.cardMeta}>
                            <span style={s.metaItem}>🕐 {fmtFecha(p.fecha_pedido)}</span>
                            <span style={s.metaItem}>{pagoOk(p) ? "✅ Pago ok" : "⏳ Sin confirmar"}</span>
                          </div>
                          {p.metodo_pago && (
                            <div style={s.cardMetodo}>💳 {p.metodo_pago}</div>
                          )}

                          {/* Acciones */}
                          {SIGUIENTE[p.estado] && (
                            <button
                              className="kan-avanzar"
                              style={{ ...s.avanzarBtn, opacity: actualizando === p.id ? 0.6 : 1 }}
                              disabled={actualizando === p.id}
                              onClick={e => { e.stopPropagation(); cambiarEstado(p.id, SIGUIENTE[p.estado]); }}
                            >
                              {actualizando === p.id ? "Actualizando…" : `→ ${COLUMNAS.find(c => c.key === SIGUIENTE[p.estado])?.label}`}
                            </button>
                          )}
                          {p.estado !== "cancelado" && p.estado !== "entregado" && (
                            <button
                              className="kan-cancelar"
                              style={s.cancelarBtn}
                              onClick={e => { e.stopPropagation(); cambiarEstado(p.id, "cancelado"); }}
                            >
                              cancelar pedido
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ LISTA ══ */}
        {!cargando && vista === "lista" && (
          <div style={s.listaWrap}>
            <div style={s.listaHeader}>
              <span style={{ ...s.th, flex: "0 0 64px" }}>#</span>
              <span style={{ ...s.th, flex: 2 }}>Cliente</span>
              <span style={{ ...s.th, flex: 2 }}>Dirección</span>
              <span style={{ ...s.th, flex: 1 }}>Método</span>
              <span style={{ ...s.th, flex: 1 }}>Total</span>
              <span style={{ ...s.th, flex: 1 }}>Estado</span>
              <span style={{ ...s.th, flex: "0 0 120px" }}>Fecha</span>
              <span style={{ ...s.th, flex: "0 0 120px" }}>Acción</span>
            </div>
            {pedidosFiltrados.length === 0 ? (
              <div style={s.empty}>No hay pedidos</div>
            ) : pedidosFiltrados
              .filter(p => clienteFiltro === null || p.cliente_id === clienteFiltro)
              .map(p => {
                const col      = COLUMNAS.find(c => c.key === p.estado) || COLUMNAS[0];
                const palette  = clienteColorMap[p.cliente_id] || CLIENTE_PALETTE[0];
                const siguiente = SIGUIENTE[p.estado];
                return (
                  <div key={p.id} className="fila-lista" style={{ ...s.fila, borderLeft: `3px solid ${palette.color}` }}
                    onClick={() => setSeleccionado(p)}>
                    <span style={{ ...s.td, flex: "0 0 64px", fontWeight: 700, color: palette.color }}>#{p.id}</span>
                    <span style={{ ...s.td, flex: 2, fontWeight: 600 }}>{nombreCompleto(p)}</span>
                    <span style={{ ...s.td, flex: 2, fontSize: 12, color: "#64748b" }}>{p.direccion_entrega}</span>
                    <span style={{ ...s.td, flex: 1, fontSize: 12 }}>{p.metodo_pago || "—"}</span>
                    <span style={{ ...s.td, flex: 1, fontWeight: 700 }}>{fmt(p.total)}</span>
                    <span style={{ ...s.td, flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, backgroundColor: col.light, color: col.color, border: `1px solid ${col.border}` }}>
                        {col.emoji} {col.label}
                      </span>
                    </span>
                    <span style={{ ...s.td, flex: "0 0 120px", fontSize: 11, color: "#94a3b8" }}>{fmtFecha(p.fecha_pedido)}</span>
                    <span style={{ ...s.td, flex: "0 0 120px" }} onClick={e => e.stopPropagation()}>
                      {siguiente ? (
                        <button style={{ ...s.avanzarBtn, fontSize: 11, padding: "4px 8px", opacity: actualizando === p.id ? 0.6 : 1 }}
                          disabled={actualizando === p.id}
                          onClick={() => cambiarEstado(p.id, siguiente)}>
                          → {COLUMNAS.find(c => c.key === siguiente)?.label}
                        </button>
                      ) : <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── MODAL DETALLE ── */}
      {seleccionado && (
        <div style={s.overlay} onClick={() => setSeleccionado(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Pedido #{seleccionado.id}</h3>
                <p style={s.modalSub}>{fmtFechaL(seleccionado.fecha_pedido)}</p>
              </div>
              <button style={s.closeBtn} onClick={() => setSeleccionado(null)}>✕</button>
            </div>

            {/* Progreso */}
            <div style={s.progreso}>
              {COLUMNAS.slice(0, 4).map((col, i) => {
                const idx    = COLUMNAS.findIndex(c => c.key === seleccionado.estado);
                const activo = i <= idx && seleccionado.estado !== "cancelado";
                const actual = COLUMNAS[i].key === seleccionado.estado;
                return (
                  <div key={col.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700,
                      backgroundColor: actual ? col.bg : activo ? "#dcfce7" : "#f1f5f9",
                      border: `2px solid ${actual ? col.border : activo ? "#86efac" : "#e2e8f0"}`,
                      color: activo ? col.color : "#94a3b8",
                    }}>
                      {activo ? col.emoji : i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: activo ? col.color : "#94a3b8", fontWeight: actual ? 700 : 400, textAlign: "center" }}>
                      {col.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={s.modalBody}>
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Cambiar estado</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SIGUIENTE[seleccionado.estado] && (
                    <button style={{ ...s.avanzarBtn, padding: "8px 16px", fontSize: 13 }}
                      disabled={actualizando === seleccionado.id}
                      onClick={() => cambiarEstado(seleccionado.id, SIGUIENTE[seleccionado.estado])}>
                      → {COLUMNAS.find(c => c.key === SIGUIENTE[seleccionado.estado])?.label}
                    </button>
                  )}
                  {seleccionado.estado !== "cancelado" && seleccionado.estado !== "entregado" && (
                    <button style={{ ...s.cancelarBtn, padding: "7px 14px", fontSize: 13 }}
                      disabled={actualizando === seleccionado.id}
                      onClick={() => cambiarEstado(seleccionado.id, "cancelado")}>
                      ❌ Cancelar pedido
                    </button>
                  )}
                  {seleccionado.estado === "entregado" && (
                    <span style={{ fontSize: 13, color: "#166534", fontWeight: 600, padding: "7px 0" }}>✅ Pedido completado</span>
                  )}
                </div>
              </div>

              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Cliente</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800,
                    backgroundColor: (clienteColorMap[seleccionado.cliente_id] || CLIENTE_PALETTE[0]).bg,
                    color: (clienteColorMap[seleccionado.cliente_id] || CLIENTE_PALETTE[0]).color,
                  }}>
                    {iniciales(seleccionado)}
                  </div>
                  <p style={{ ...s.detailVal, margin: 0 }}>{nombreCompleto(seleccionado)}</p>
                </div>
              </div>

              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Dirección de entrega</p>
                <p style={s.detailVal}>📍 {seleccionado.direccion_entrega}</p>
              </div>

              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Método de pago</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <p style={{ ...s.detailVal, margin: 0 }}>{seleccionado.metodo_pago || "—"}</p>
                  <span style={pagoOk(seleccionado) ? s.pagoBadgeOk : s.pagoBadgePend}>
                    {pagoOk(seleccionado) ? "✅ Pagado" : "⏳ Sin confirmar"}
                  </span>
                </div>
                {!pagoOk(seleccionado) && (
                  <p style={s.pagoAviso}>⚠️ Al avanzar el estado confirmas que recibiste el pago.</p>
                )}
              </div>

              {seleccionado.notas && (
                <div style={s.detailSection}>
                  <p style={s.sectionLabel}>Notas</p>
                  <p style={s.detailVal}>{seleccionado.notas}</p>
                </div>
              )}

              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Productos</p>
                <div style={s.productosList}>
                  {(seleccionado.detalle || []).map((d, i) => (
                    <div key={i} style={s.productoRow}>
                      <span style={s.productoNombre}>{d.producto}</span>
                      <span style={s.productoKilos}>{d.kilos} kg</span>
                      <span style={s.productoPrecio}>{fmt(d.precio_unitario)}/kg</span>
                      <span style={s.productoSubtotal}>{fmt(d.kilos * d.precio_unitario)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total del pedido</span>
                <span style={{ ...s.totalVal, color: "#3674B5" }}>
                  {fmt(seleccionado.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
  root: { padding: 28, fontFamily: "'Sora', 'Inter', sans-serif", minHeight: "100%" },

  header:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title:    { fontSize: 20, fontWeight: 700, color: "#0B1628", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", margin: "4px 0 0" },

  // Live indicator
  liveWrap:     { display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 11px" },
  liveDot:      { width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e", animation: "livePulse 2s ease infinite", flexShrink: 0 },
  liveTexto:    { fontSize: 11, color: "#166534", fontWeight: 500 },
  liveCountdown:{ fontSize: 10, color: "#86efac", fontWeight: 700, marginLeft: 2 },

  buscador:    { padding: "8px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", minWidth: 210, color: "#0B1628", backgroundColor: "white" },
  vistaTabs:   { display: "flex", borderRadius: 9, border: "1px solid #e2e8f0", overflow: "hidden", backgroundColor: "white" },
  vistaBtn:    { padding: "7px 14px", border: "none", background: "none", fontSize: 12, fontWeight: 500, color: "#64748b", cursor: "pointer" },
  vistaBtnActive: { backgroundColor: "#3674B5", color: "white", fontWeight: 700 },
  refreshBtn:  { padding: "8px 12px", background: "#EEF4FF", border: "1px solid #bfdbfe", borderRadius: 9, fontSize: 16, color: "#3674B5", cursor: "pointer", lineHeight: 1 },

  // Stats
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 },
  statCard: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3 },
  statLabel:{ fontSize: 12, color: "#64748b" },

  // Chips de cliente
  chipsWrap:  { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" },
  chipsLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 },
  chip: { display: "flex", alignItems: "center", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },

  // Kanban
  kanban:  { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, alignItems: "start" },
  columna: { background: "#f8fafc", borderRadius: 14, border: "1px solid #e8f0ed", overflow: "hidden", minHeight: 200 },
  colHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "white" },
  colBadge:  { fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 },
  colBody:   { padding: "10px 10px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 80 },
  colEmpty:  { textAlign: "center", padding: "20px 8px", color: "#cbd5e1", fontSize: 12 },

  // Card
  card:       { background: "white", borderRadius: 12, border: "1px solid #e8f0ed", borderLeft: "3px solid #3674B5", padding: "13px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  cardTop:    { display: "flex", alignItems: "flex-start", gap: 10 },
  avatar:     { width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  cardCliente:{ fontSize: 13, fontWeight: 700, color: "#0B1628", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 },
  cardId:     { fontSize: 11, color: "#94a3b8", margin: 0 },
  cardMeta:   { display: "flex", gap: 6, flexWrap: "wrap" },
  metaItem:   { fontSize: 10, color: "#64748b", backgroundColor: "#f8fafc", padding: "2px 6px", borderRadius: 6, border: "1px solid #e8f0ed" },
  cardMetodo: { fontSize: 11, color: "#64748b" },
  avanzarBtn: { padding: "6px 10px", background: "#3674B5", color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center" },
  cancelarBtn:{ padding: "3px 0", background: "none", color: "#94a3b8", border: "none", fontSize: 10, fontWeight: 500, cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "underline", textDecorationStyle: "dotted" },

  // Lista
  listaWrap:   { background: "#fff", borderRadius: 14, border: "1px solid #e8f0ed", overflow: "hidden" },
  listaHeader: { display: "flex", padding: "11px 18px", background: "#f8fafc", borderBottom: "1px solid #e8f0ed" },
  th:          { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  fila:        { display: "flex", padding: "13px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "center", cursor: "pointer", transition: "background 0.15s" },
  td:          { fontSize: 13, color: "#0B1628" },

  empty: { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 },

  // Modal
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal:       { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" },
  modalHeader: { padding: "20px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle:  { fontSize: 18, fontWeight: 700, color: "#0B1628", margin: 0 },
  modalSub:    { fontSize: 12, color: "#94a3b8", margin: "4px 0 0" },
  closeBtn:    { background: "#f0f4f8", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: "#64748b" },
  progreso:    { display: "flex", justifyContent: "space-around", padding: "16px 24px", borderBottom: "1px solid #f0f4f8", backgroundColor: "#fafbfc" },
  modalBody:   { padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 },

  detailSection:{ display: "flex", flexDirection: "column", gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 },
  detailVal:    { fontSize: 14, color: "#0B1628", margin: 0 },

  pagoBadgeOk:  { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
  pagoBadgePend:{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" },
  pagoAviso:    { fontSize: 12, color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", margin: "4px 0 0" },

  productosList:   { display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc", borderRadius: 10, padding: 12, border: "1px solid #e8f0ed" },
  productoRow:     { display: "flex", gap: 10, alignItems: "center", fontSize: 13 },
  productoNombre:  { flex: 2, fontWeight: 600, color: "#0B1628" },
  productoKilos:   { flex: "0 0 55px", color: "#64748b" },
  productoPrecio:  { flex: "0 0 90px", color: "#64748b", fontSize: 12 },
  productoSubtotal:{ flex: "0 0 80px", fontWeight: 700, textAlign: "right" },

  totalRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" },
  totalLabel:{ fontSize: 14, fontWeight: 700, color: "#0B1628" },
  totalVal:  { fontSize: 22, fontWeight: 800 },
};
