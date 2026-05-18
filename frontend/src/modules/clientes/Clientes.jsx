import { useState, useEffect } from "react";
import useClientes from "./hooks/useClientes";
import FormCliente from "./components/FormCliente";
import { getHistorialCliente } from "../../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const token = () => localStorage.getItem("token");

// ── Badge VIP ─────────────────────────────────────────────────────────────────
function getBadge(compras) {
  if (compras >= 10) return { label: "⭐ VIP",       color: "#854d0e", bg: "#fef3c7" };
  if (compras >= 5)  return { label: "🔥 Frecuente", color: "#1e40af", bg: "#dbeafe" };
  if (compras >= 2)  return { label: "✅ Regular",   color: "#166534", bg: "#dcfce7" };
  return               { label: "🆕 Nuevo",          color: "#6b7280", bg: "#f1f5f9" };
}

// ── Panel de perfil ───────────────────────────────────────────────────────────
function PerfilCliente({ cliente, onCerrar, onEditar }) {
  const [historial, setHistorial]   = useState([]);
  const [cargando,  setCargando]    = useState(true);

  useEffect(() => {
    if (!cliente) return;
    setCargando(true);
    getHistorialCliente(cliente.id, token()).then(data => {
      setHistorial(data || []);
      setCargando(false);
    });
  }, [cliente?.id]);

  if (!cliente) return null;

  const total     = historial.reduce((s, v) => s + Number(v.total || 0), 0);
  const compras   = historial.length;
  const promedio  = compras > 0 ? total / compras : 0;
  const ultima    = historial[0]?.fecha
    ? new Date(historial[0].fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const badge     = getBadge(compras);
  const inicial   = `${cliente.nombre?.[0] || ""}${cliente.apellido?.[0] || ""}`.toUpperCase();

  return (
    <div style={p.panel}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes statPop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{ animation: "slideIn 0.3s ease both" }}>

        {/* Close + Edit */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>Perfil del cliente</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={p.editBtn} onClick={() => onEditar(cliente)}>✏️ Editar</button>
            <button style={p.closeBtn} onClick={onCerrar}>✕</button>
          </div>
        </div>

        {/* Avatar + nombre */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={p.avatar}>{inicial}</div>
          <h3 style={p.nombre}>{cliente.nombre} {cliente.apellido}</h3>
          <p style={p.usuario}>@{cliente.usuario}</p>
          <span style={{ ...p.badge, backgroundColor: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        </div>

        {/* Info contacto */}
        <div style={p.infoRow}>
          {cliente.telefono && (
            <div style={p.infoItem}>
              <span style={p.infoIcon}>📞</span>
              <span style={p.infoText}>{cliente.telefono}</span>
            </div>
          )}
          {cliente.numero_documento && (
            <div style={p.infoItem}>
              <span style={p.infoIcon}>🪪</span>
              <span style={p.infoText}>{cliente.numero_documento}</span>
            </div>
          )}
        </div>

        <div style={p.divider} />

        {/* Stats de compras */}
        {cargando ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ ...p.statCard, animation: "none" }}>
                <div style={{ width: "60%", height: "12px", borderRadius: "4px", background: "#f1f5f9", marginBottom: "6px" }} />
                <div style={{ width: "80%", height: "18px", borderRadius: "4px", background: "#e2e8f0" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Total comprado", value: fmt(total),           delay: 0 },
              { label: "N° de compras",  value: compras,              delay: 60 },
              { label: "Promedio",       value: fmt(promedio),        delay: 120 },
              { label: "Última compra",  value: ultima,               delay: 180 },
            ].map((st, i) => (
              <div key={i} style={{ ...p.statCard, animation: `statPop 0.35s ease ${st.delay}ms both` }}>
                <span style={p.statLabel}>{st.label}</span>
                <span style={p.statValue}>{st.value}</span>
              </div>
            ))}
          </div>
        )}

        <div style={p.divider} />

        {/* Historial reciente */}
        <div style={{ marginTop: "16px" }}>
          <h4 style={p.sectionTitle}>Últimas compras</h4>
          {cargando ? (
            <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px 0" }}>
              Cargando historial…
            </div>
          ) : historial.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
              <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🛒</span>
              <span style={{ fontSize: "13px" }}>Sin compras registradas</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {historial.slice(0, 5).map((v, i) => (
                <div key={v.venta_id} style={{
                  ...p.histRow,
                  animation: `statPop 0.3s ease ${i * 50}ms both`,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a", margin: 0 }}>
                      {new Date(v.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                      {v.metodo_pago || "N/A"} · {v.detalle?.length || 0} producto{v.detalle?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span style={p.histTotal}>{fmt(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Clientes() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useClientes();

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // para editar
  const [clienteViendo,       setClienteViendo]       = useState(null); // para ver perfil
  const [mostrarForm,         setMostrarForm]         = useState(false);
  const [busqueda,            setBusqueda]            = useState("");
  const [paginaActual,        setPaginaActual]        = useState(1);
  const [clientesPorPagina,   setClientesPorPagina]   = useState(10);

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexUltimo    = paginaActual * clientesPorPagina;
  const indexPrimero   = indexUltimo - clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas   = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  useEffect(() => { setPaginaActual(1); }, [busqueda, clientesPorPagina]);

  const handleGuardar = (data) => {
    if (clienteSeleccionado) {
      editarCliente(clienteSeleccionado.id, data);
      setClienteSeleccionado(null);
    } else {
      agregarCliente(data);
    }
    setMostrarForm(false);
  };

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarForm(true);
    setClienteViendo(null);
  };

  const handleNuevo = () => {
    setClienteSeleccionado(null);
    setMostrarForm(true);
  };

  return (
    <>
      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cli-row:hover { background: #f8fafc !important; }
        .cli-row.cli-active { background: #EEF4FF !important; border-left: 3px solid #3674B5 !important; }
      `}</style>

      <div style={s.page}>

        {/* HEADER */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}>👥</span>
            <div>
              <h2 style={s.headerTitle}>Clientes</h2>
              <p style={s.headerSub}>{clientes.length} clientes registrados</p>
            </div>
          </div>
          <button style={s.btnNew} onClick={handleNuevo}>+ Nuevo Cliente</button>
        </div>

        {/* STAT CARDS */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statLabel}>Total clientes</span>
            <span style={{ ...s.statValue, color: "#3674B5" }}>{clientes.length}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statLabel}>Resultados</span>
            <span style={s.statValue}>{clientesFiltrados.length}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statLabel}>Página actual</span>
            <span style={s.statValue}>{paginaActual} / {totalPaginas || 1}</span>
          </div>
        </div>

        {/* CONTROLES */}
        <div style={s.controls}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Buscar cliente por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={s.selectWrap}>
            <label style={s.selectLabel}>Mostrar:</label>
            <select
              style={s.select}
              value={clientesPorPagina}
              onChange={(e) => setClientesPorPagina(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* LAYOUT SPLIT */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

          {/* LISTA DE CLIENTES */}
          <div style={{ flex: clienteViendo ? "0 0 55%" : "1", minWidth: 0 }}>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Cliente</th>
                    <th style={s.th}>Usuario</th>
                    <th style={s.th}>Teléfono</th>
                    <th style={{ ...s.th, textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                        <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>👥</span>
                        No se encontraron clientes
                      </td>
                    </tr>
                  ) : clientesPaginados.map((c, idx) => {
                    const activo = clienteViendo?.id === c.id;
                    const badge  = getBadge(0); // placeholder, se calcula en el perfil
                    const inicial = `${c.nombre?.[0] || ""}${c.apellido?.[0] || ""}`.toUpperCase();
                    return (
                      <tr
                        key={c.id}
                        className={`cli-row${activo ? " cli-active" : ""}`}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          animation: `rowIn 0.3s ease ${idx * 40}ms both`,
                          borderLeft: activo ? "3px solid #3674B5" : "3px solid transparent",
                        }}
                        onClick={() => setClienteViendo(activo ? null : c)}
                      >
                        <td style={s.td}>
                          <div style={s.clienteInfo}>
                            <div style={{ ...s.avatar, ...(activo ? { background: "linear-gradient(135deg, #3674B5, #60a5fa)", color: "#fff" } : {}) }}>
                              {inicial}
                            </div>
                            <div>
                              <div style={s.nombre}>{c.nombre} {c.apellido}</div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}><span style={s.usuario}>{c.usuario}</span></td>
                        <td style={s.td}><span style={s.telefono}>{c.telefono || "—"}</span></td>
                        <td style={{ ...s.td, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                          <div style={s.actions}>
                            <button style={s.editBtn} onClick={() => handleEditar(c)}>✏️ Editar</button>
                            <button style={s.deleteBtn} onClick={() => { borrarCliente(c.id); if (clienteViendo?.id === c.id) setClienteViendo(null); }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div style={s.pagination}>
              <button
                style={{ ...s.pageBtn, opacity: paginaActual === 1 ? 0.4 : 1 }}
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
              >← Anterior</button>
              <span style={s.pageInfo}>Página {paginaActual} de {totalPaginas || 1}</span>
              <button
                style={{ ...s.pageBtn, opacity: (paginaActual === totalPaginas || totalPaginas === 0) ? 0.4 : 1 }}
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
              >Siguiente →</button>
            </div>
          </div>

          {/* PANEL PERFIL */}
          {clienteViendo && (
            <div style={{ flex: "0 0 42%", minWidth: 0 }}>
              <PerfilCliente
                cliente={clienteViendo}
                onCerrar={() => setClienteViendo(null)}
                onEditar={handleEditar}
              />
            </div>
          )}
        </div>

        {/* MODAL FORM */}
        {mostrarForm && (
          <div style={s.modalOverlay} onClick={() => setMostrarForm(false)}>
            <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h3 style={s.modalTitle}>
                  {clienteSeleccionado ? "Editar cliente" : "Nuevo cliente"}
                </h3>
                <button style={s.modalClose} onClick={() => setMostrarForm(false)}>✕</button>
              </div>
              <FormCliente
                onGuardar={handleGuardar}
                clienteSeleccionado={clienteSeleccionado}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "24px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerIcon: { fontSize: "22px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  headerSub: { fontSize: "12px", color: "#94a3b8", marginTop: "3px" },
  btnNew: {
    padding: "9px 20px", backgroundColor: "#3674B5",
    color: "white", border: "none", borderRadius: "10px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600",
  },

  statsRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  statCard: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px",
    border: "1px solid #e2e8f0",
  },
  statLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#0f172a" },

  controls: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  searchWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px" },
  searchInput: {
    width: "100%", padding: "9px 12px 9px 34px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", outline: "none", backgroundColor: "#fff",
  },
  selectWrap: { display: "flex", alignItems: "center", gap: "6px" },
  selectLabel: { fontSize: "13px", color: "#64748b" },
  select: {
    padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0",
    fontSize: "13px", color: "#0f172a", backgroundColor: "#fff", cursor: "pointer",
  },

  tableWrap: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  td: { padding: "12px 16px", fontSize: "14px", color: "#334155" },

  clienteInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    backgroundColor: "#EEF4FF", color: "#3674B5",
    fontSize: "12px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.2s",
  },
  nombre:   { fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  usuario:  { fontSize: "13px", color: "#64748b" },
  telefono: { fontSize: "13px", color: "#64748b" },

  actions: { display: "flex", gap: "6px", justifyContent: "center" },
  editBtn: {
    padding: "5px 12px", fontSize: "12px", fontWeight: "600",
    border: "1.5px solid #3674B5", borderRadius: "7px",
    backgroundColor: "transparent", color: "#3674B5", cursor: "pointer",
  },
  deleteBtn: {
    padding: "5px 10px", fontSize: "13px",
    border: "1.5px solid #ef4444", borderRadius: "7px",
    backgroundColor: "transparent", color: "#dc2626", cursor: "pointer",
  },

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "16px" },
  pageBtn: {
    padding: "7px 18px", borderRadius: "8px",
    border: "1px solid #e2e8f0", backgroundColor: "#fff",
    cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#0f172a",
  },
  pageInfo: { fontSize: "13px", color: "#64748b", minWidth: "110px", textAlign: "center" },

  modalOverlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modalCard: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px", width: "100%", maxWidth: "480px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle:  { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  modalClose: {
    background: "none", border: "none", fontSize: "16px",
    cursor: "pointer", color: "#94a3b8", padding: "4px",
  },
};

// ── Estilos del panel perfil ──────────────────────────────────────────────────
const p = {
  panel: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "22px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    position: "sticky",
    top: "16px",
  },
  avatar: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "linear-gradient(135deg, #3674B5, #60a5fa)",
    color: "#fff", fontSize: "22px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 10px",
    boxShadow: "0 4px 14px rgba(54,116,181,0.35)",
  },
  nombre:  { fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "0 0 3px" },
  usuario: { fontSize: "13px", color: "#94a3b8", margin: "0 0 10px" },
  badge: {
    display: "inline-block", padding: "3px 12px",
    borderRadius: "999px", fontSize: "12px", fontWeight: "700",
  },
  infoRow: { display: "flex", flexDirection: "column", gap: "6px", margin: "14px 0 0" },
  infoItem: { display: "flex", alignItems: "center", gap: "8px" },
  infoIcon: { fontSize: "14px" },
  infoText: { fontSize: "13px", color: "#475569" },
  divider: { height: "1px", background: "#f1f5f9", margin: "16px 0" },

  statCard: {
    background: "#f8fafc", borderRadius: "10px",
    padding: "10px 14px", border: "1px solid #e8edf2",
  },
  statLabel: { display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
  statValue: { display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a" },

  sectionTitle: { fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" },

  histRow: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 12px", borderRadius: "9px",
    backgroundColor: "#f8fafc", border: "1px solid #f1f5f9",
  },
  histTotal: { fontSize: "13px", fontWeight: "700", color: "#3674B5", whiteSpace: "nowrap" },

  editBtn: {
    padding: "5px 12px", fontSize: "12px", fontWeight: "600",
    border: "1.5px solid #3674B5", borderRadius: "7px",
    backgroundColor: "transparent", color: "#3674B5", cursor: "pointer",
  },
  closeBtn: {
    padding: "5px 10px", fontSize: "13px",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    backgroundColor: "#f8fafc", color: "#64748b", cursor: "pointer",
  },
};
