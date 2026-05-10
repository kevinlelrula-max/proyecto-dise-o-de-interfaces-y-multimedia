import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS = ["todos", "pendiente", "en preparacion", "enviado", "entregado", "cancelado"];

const ESTADO_COLORS = {
  pendiente:        { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "en preparacion": { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
  enviado:          { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  entregado:        { bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" },
  cancelado:        { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
};

const ESTADO_LABELS = {
  pendiente:        "Pendiente",
  "en preparacion": "En preparación",
  enviado:          "Enviado",
  entregado:        "Entregado",
  cancelado:        "Cancelado",
};

const SIGUIENTE_ESTADO = {
  pendiente:        "en preparacion",
  "en preparacion": "enviado",
  enviado:          "entregado",
};

function formatPrecio(p) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(p);
}

function formatFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PedidosEmpresa() {
  const [pedidos, setPedidos]         = useState([]);
  const [filtro, setFiltro]           = useState("todos");
  const [cargando, setCargando]       = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [busqueda, setBusqueda]       = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/pedidos/empresa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    setActualizando(pedidoId);
    try {
      const res = await fetch(`${API}/api/pedidos/${pedidoId}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setPedidos((prev) =>
          prev.map((p) => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)
        );
        if (seleccionado?.id === pedidoId) {
          setSeleccionado((prev) => ({ ...prev, estado: nuevoEstado }));
        }
      }
    } finally {
      setActualizando(null);
    }
  };

  const pedidosFiltrados = pedidos
    .filter((p) => filtro === "todos" || p.estado === filtro)
    .filter((p) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      const nombre = `${p.cliente_nombre ?? ""} ${p.cliente_apellido ?? ""} ${p.cliente_usuario ?? ""}`.toLowerCase();
      return nombre.includes(q) || String(p.id).includes(q);
    });

  const conteos = ESTADOS.slice(1).reduce((acc, e) => {
    acc[e] = pedidos.filter((p) => p.estado === e).length;
    return acc;
  }, {});

  return (
    <div style={s.root}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Pedidos online</h2>
          <p style={s.subtitle}>{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} en total</p>
        </div>
        <button style={s.refreshBtn} onClick={cargarPedidos} disabled={cargando}>
          {cargando ? "Cargando…" : "↻ Actualizar"}
        </button>
      </div>

      {/* ── TARJETAS RESUMEN ── */}
      <div style={s.statsRow}>
        {[
          { label: "Pendientes",    key: "pendiente",        emoji: "🕐" },
          { label: "En preparación",key: "en preparacion",   emoji: "👨‍🍳" },
          { label: "Enviados",      key: "enviado",          emoji: "🚚" },
          { label: "Entregados",    key: "entregado",        emoji: "✅" },
        ].map(({ label, key, emoji }) => (
          <div key={key} style={{ ...s.statCard, cursor: "pointer", ...(filtro === key ? s.statCardActive : {}) }}
            onClick={() => setFiltro(filtro === key ? "todos" : key)}>
            <span style={s.statEmoji}>{emoji}</span>
            <span style={s.statNum}>{conteos[key] || 0}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── FILTROS + BÚSQUEDA ── */}
      <div style={s.toolbar}>
        <div style={s.filtrosWrap}>
          {ESTADOS.map((e) => (
            <button key={e} style={{ ...s.filtroBtn, ...(filtro === e ? s.filtroBtnActive : {}) }}
              onClick={() => setFiltro(e)}>
              {e === "todos" ? "Todos" : ESTADO_LABELS[e]}
              {e !== "todos" && conteos[e] > 0 && (
                <span style={s.badge}>{conteos[e]}</span>
              )}
            </button>
          ))}
        </div>
        <input
          style={s.buscador}
          placeholder="Buscar por cliente o # pedido…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* ── TABLA ── */}
      {cargando ? (
        <div style={s.empty}>Cargando pedidos…</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={s.empty}>No hay pedidos {filtro !== "todos" ? `con estado "${ESTADO_LABELS[filtro]}"` : ""}</div>
      ) : (
        <div style={s.tabla}>
          <div style={s.tablaHeader}>
            <span style={{ ...s.th, flex: "0 0 70px" }}>#</span>
            <span style={{ ...s.th, flex: 2 }}>Cliente</span>
            <span style={{ ...s.th, flex: 2 }}>Dirección</span>
            <span style={{ ...s.th, flex: 1 }}>Método</span>
            <span style={{ ...s.th, flex: 1 }}>Total</span>
            <span style={{ ...s.th, flex: 1 }}>Estado</span>
            <span style={{ ...s.th, flex: "0 0 130px" }}>Fecha</span>
            <span style={{ ...s.th, flex: "0 0 110px" }}>Acción</span>
          </div>

          {pedidosFiltrados.map((p) => {
            const col = ESTADO_COLORS[p.estado] || ESTADO_COLORS.pendiente;
            const siguiente = SIGUIENTE_ESTADO[p.estado];
            return (
              <div key={p.id} style={s.fila} onClick={() => setSeleccionado(p)}>
                <span style={{ ...s.td, flex: "0 0 70px", fontWeight: 700, color: "#0F6E56" }}>
                  #{p.id}
                </span>
                <span style={{ ...s.td, flex: 2 }}>
                  {p.cliente_nombre
                    ? `${p.cliente_nombre} ${p.cliente_apellido || ""}`
                    : p.cliente_usuario || "—"}
                </span>
                <span style={{ ...s.td, flex: 2, color: "#64748b", fontSize: 12 }}>
                  {p.direccion_entrega}
                </span>
                <span style={{ ...s.td, flex: 1, fontSize: 12 }}>{p.metodo_pago || "—"}</span>
                <span style={{ ...s.td, flex: 1, fontWeight: 700 }}>{formatPrecio(p.total)}</span>
                <span style={{ ...s.td, flex: 1 }}>
                  <span style={{ ...s.estadoBadge, background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                    {ESTADO_LABELS[p.estado] || p.estado}
                  </span>
                </span>
                <span style={{ ...s.td, flex: "0 0 130px", fontSize: 11, color: "#94a3b8" }}>
                  {formatFecha(p.fecha_pedido)}
                </span>
                <span style={{ ...s.td, flex: "0 0 110px" }} onClick={(e) => e.stopPropagation()}>
                  {siguiente ? (
                    <button
                      style={{ ...s.avanzarBtn, opacity: actualizando === p.id ? 0.6 : 1 }}
                      disabled={actualizando === p.id}
                      onClick={() => cambiarEstado(p.id, siguiente)}
                    >
                      {actualizando === p.id ? "…" : `→ ${ESTADO_LABELS[siguiente]}`}
                    </button>
                  ) : p.estado !== "cancelado" ? (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Completado</span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      {seleccionado && (
        <div style={s.overlay} onClick={() => setSeleccionado(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Pedido #{seleccionado.id}</h3>
                <p style={s.modalSub}>{formatFecha(seleccionado.fecha_pedido)}</p>
              </div>
              <button style={s.closeBtn} onClick={() => setSeleccionado(null)}>✕</button>
            </div>

            <div style={s.modalBody}>
              {/* Estado */}
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Estado actual</p>
                <div style={s.estadoRow}>
                  {(() => {
                    const col = ESTADO_COLORS[seleccionado.estado] || ESTADO_COLORS.pendiente;
                    return (
                      <span style={{ ...s.estadoBadge, background: col.bg, color: col.text, border: `1px solid ${col.border}`, fontSize: 13, padding: "5px 12px" }}>
                        {ESTADO_LABELS[seleccionado.estado] || seleccionado.estado}
                      </span>
                    );
                  })()}
                  {SIGUIENTE_ESTADO[seleccionado.estado] && (
                    <button
                      style={{ ...s.avanzarBtn, padding: "7px 14px", fontSize: 13 }}
                      disabled={actualizando === seleccionado.id}
                      onClick={() => cambiarEstado(seleccionado.id, SIGUIENTE_ESTADO[seleccionado.estado])}
                    >
                      → {ESTADO_LABELS[SIGUIENTE_ESTADO[seleccionado.estado]]}
                    </button>
                  )}
                  {seleccionado.estado !== "cancelado" && seleccionado.estado !== "entregado" && (
                    <button
                      style={{ ...s.cancelarBtn }}
                      disabled={actualizando === seleccionado.id}
                      onClick={() => cambiarEstado(seleccionado.id, "cancelado")}
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Cliente</p>
                <p style={s.detailVal}>
                  {seleccionado.cliente_nombre
                    ? `${seleccionado.cliente_nombre} ${seleccionado.cliente_apellido || ""}`
                    : seleccionado.cliente_usuario || "—"}
                </p>
              </div>

              {/* Dirección */}
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Dirección de entrega</p>
                <p style={s.detailVal}>{seleccionado.direccion_entrega}</p>
              </div>

              {/* Método de pago */}
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Método de pago</p>
                <p style={s.detailVal}>{seleccionado.metodo_pago || "—"}</p>
              </div>

              {/* Notas */}
              {seleccionado.notas && (
                <div style={s.detailSection}>
                  <p style={s.sectionLabel}>Notas</p>
                  <p style={s.detailVal}>{seleccionado.notas}</p>
                </div>
              )}

              {/* Productos */}
              <div style={s.detailSection}>
                <p style={s.sectionLabel}>Productos</p>
                <div style={s.productosList}>
                  {(seleccionado.detalle || []).map((d, i) => (
                    <div key={i} style={s.productoRow}>
                      <span style={s.productoNombre}>{d.producto}</span>
                      <span style={s.productoKilos}>{d.kilos} kg</span>
                      <span style={s.productoPrecio}>{formatPrecio(d.precio_unitario)}/kg</span>
                      <span style={s.productoSubtotal}>{formatPrecio(d.kilos * d.precio_unitario)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total del pedido</span>
                <span style={s.totalVal}>{formatPrecio(seleccionado.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { padding: 28, fontFamily: "'Sora', 'Inter', sans-serif", minHeight: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#0B1628", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", margin: "4px 0 0" },
  refreshBtn: { padding: "8px 16px", background: "#f0f7f4", border: "1px solid #c8e6dc", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#0F6E56", cursor: "pointer" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 },
  statCard: { background: "#fff", border: "1.5px solid #e8f0ed", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4, transition: "all 0.15s" },
  statCardActive: { border: "1.5px solid #0F6E56", background: "#f0f7f4" },
  statEmoji: { fontSize: 20 },
  statNum: { fontSize: 28, fontWeight: 800, color: "#0B1628", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },

  toolbar: { display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  filtrosWrap: { display: "flex", gap: 6, flexWrap: "wrap" },
  filtroBtn: { padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 500, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" },
  filtroBtnActive: { background: "#0F6E56", borderColor: "#0F6E56", color: "#fff" },
  badge: { background: "rgba(255,255,255,0.3)", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 },
  buscador: { marginLeft: "auto", padding: "8px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", minWidth: 220, color: "#0B1628" },

  tabla: { background: "#fff", borderRadius: 14, border: "1px solid #e8f0ed", overflow: "hidden" },
  tablaHeader: { display: "flex", padding: "11px 18px", background: "#f8faf9", borderBottom: "1px solid #e8f0ed" },
  th: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  fila: { display: "flex", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "center", cursor: "pointer", transition: "background 0.12s" },
  td: { fontSize: 13, color: "#0B1628" },
  estadoBadge: { fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, display: "inline-block" },
  avanzarBtn: { padding: "5px 10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  empty: { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" },
  modalHeader: { padding: "20px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#0B1628", margin: 0 },
  modalSub: { fontSize: 12, color: "#94a3b8", margin: "4px 0 0" },
  closeBtn: { background: "#f0f4f8", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: "#64748b" },
  modalBody: { padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 },

  detailSection: { display: "flex", flexDirection: "column", gap: 6 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 },
  detailVal: { fontSize: 14, color: "#0B1628", margin: 0 },
  estadoRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  cancelarBtn: { padding: "5px 12px", background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },

  productosList: { display: "flex", flexDirection: "column", gap: 8, background: "#f8faf9", borderRadius: 10, padding: 12, border: "1px solid #e8f0ed" },
  productoRow: { display: "flex", gap: 10, alignItems: "center", fontSize: 13 },
  productoNombre: { flex: 2, fontWeight: 600, color: "#0B1628" },
  productoKilos: { flex: "0 0 60px", color: "#64748b" },
  productoPrecio: { flex: "0 0 90px", color: "#64748b", fontSize: 12 },
  productoSubtotal: { flex: "0 0 80px", fontWeight: 700, color: "#0F6E56", textAlign: "right" },

  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f7f4", borderRadius: 10, padding: "12px 16px", border: "1px solid #c8e6dc" },
  totalLabel: { fontSize: 14, fontWeight: 700, color: "#0B1628" },
  totalVal: { fontSize: 22, fontWeight: 800, color: "#0F6E56" },
};
