import { useEffect, useState } from "react";
import { getVentasEmpresa } from "../services/api";

const METODOS_ICONO = {
  "Efectivo": "💵",
  "Tarjeta": "💳",
  "Transferencia": "🏦",
  "Nequi": "📱",
  "Daviplata": "📱",
};

const ESTADO_META = {
  "completada":     { label: "Completada",     color: "#166534", bg: "#dcfce7" },
  "pendiente":      { label: "Pendiente",       color: "#92400e", bg: "#fef3c7" },
  "en preparacion": { label: "En preparación",  color: "#1e40af", bg: "#dbeafe" },
  "enviado":        { label: "Enviado",          color: "#0e7490", bg: "#cffafe" },
  "entregado":      { label: "Entregado",        color: "#166534", bg: "#dcfce7" },
};

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const ventasPorPagina = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getVentasEmpresa(token);
        setVentas(data || []);
      } catch (error) {
        console.error("Error cargando ventas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroOrigen]);

  const ventasFiltradas = ventas.filter((v) => {
    const coincideBusqueda =
      (v.cliente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.metodo_pago || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideOrigen =
      filtroOrigen === "todos" ||
      (filtroOrigen === "pos"    && v.origen === "POS") ||
      (filtroOrigen === "online" && v.origen === "Tienda online");
    return coincideBusqueda && coincideOrigen;
  });

  const totalPOS    = ventas.filter(v => v.origen === "POS").length;
  const totalOnline = ventas.filter(v => v.origen === "Tienda online").length;

  const totalGeneral = ventas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const promedioVenta = ventas.length > 0 ? totalGeneral / ventas.length : 0;
  const ventaMaxima = ventas.length > 0
    ? Math.max(...ventas.map(v => Number(v.total) || 0))
    : 0;

  const indexUltimo = paginaActual * ventasPorPagina;
  const indexPrimero = indexUltimo - ventasPorPagina;
  const ventasPaginadas = ventasFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina);

  if (loading) {
    return (
      <div style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>
        Cargando ventas...
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "22px" }}>🧾</span>
          <div>
            <h2 style={s.headerTitle}>Historial de Ventas</h2>
            <p style={s.headerSub}>POS + Tienda online · excluye pedidos cancelados</p>
          </div>
        </div>
        <div style={s.origenFiltros}>
          {[
            { key: "todos",  label: "Todos",        count: ventas.length },
            { key: "pos",    label: "💻 POS",        count: totalPOS },
            { key: "online", label: "🛒 Tienda",     count: totalOnline },
          ].map(o => (
            <button
              key={o.key}
              style={{ ...s.origenBtn, ...(filtroOrigen === o.key ? s.origenBtnActive : {}) }}
              onClick={() => setFiltroOrigen(o.key)}
            >
              {o.label}
              <span style={{ ...s.origenCount, ...(filtroOrigen === o.key ? { backgroundColor: "rgba(255,255,255,0.25)" } : {}) }}>
                {o.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total ventas</span>
          <span style={{ ...s.statValue, color: "#3674B5" }}>{ventas.length}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Ingresos totales</span>
          <span style={{ ...s.statValue, color: "#3674B5", fontSize: "18px" }}>
            ${totalGeneral.toLocaleString()}
          </span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Promedio por venta</span>
          <span style={{ ...s.statValue, fontSize: "18px" }}>
            ${Math.round(promedioVenta).toLocaleString()}
          </span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Venta más alta</span>
          <span style={{ ...s.statValue, fontSize: "18px" }}>
            ${ventaMaxima.toLocaleString()}
          </span>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={s.controls}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Buscar por cliente o método de pago..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <span style={s.resultCount}>
          {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* TABLA */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Cliente</th>
              <th style={s.th}>Fecha</th>
              <th style={s.th}>Origen</th>
              <th style={s.th}>Método de pago</th>
              <th style={{ ...s.th, textAlign: "right" }}>Total</th>
              <th style={{ ...s.th, textAlign: "center" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventasPaginadas.length > 0 ? (
              ventasPaginadas.map((v, idx) => {
                const estadoMeta = ESTADO_META[v.estado?.toLowerCase()] || ESTADO_META["completada"];
                return (
                <tr key={`${v.origen}-${v.venta_id}-${idx}`} style={s.row}>

                  {/* Cliente */}
                  <td style={s.td}>
                    <div style={s.clienteWrap}>
                      <div style={s.avatar}>
                        {(v.cliente || "?").charAt(0).toUpperCase()}
                      </div>
                      <span style={s.clienteNombre}>
                        {v.cliente || "Sin cliente"}
                      </span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td style={s.td}>
                    <div style={s.fechaWrap}>
                      <span style={s.fecha}>
                        {v.fecha
                          ? new Date(v.fecha).toLocaleDateString("es-CO", {
                              day: "2-digit", month: "short", year: "numeric"
                            })
                          : "Sin fecha"}
                      </span>
                      {v.fecha && (
                        <span style={s.hora}>
                          {new Date(v.fecha).toLocaleTimeString("es-CO", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Origen */}
                  <td style={s.td}>
                    <span style={{
                      ...s.origenBadge,
                      ...(v.origen === "POS"
                        ? { backgroundColor: "#f1f5f9", color: "#475569" }
                        : { backgroundColor: "#eff6ff", color: "#1e40af" }),
                    }}>
                      {v.origen === "POS" ? "💻 POS" : "🛒 Tienda"}
                    </span>
                  </td>

                  {/* Método de pago */}
                  <td style={s.td}>
                    <span style={s.metodoBadge}>
                      {METODOS_ICONO[v.metodo_pago] || "💳"} {v.metodo_pago || "N/A"}
                    </span>
                  </td>

                  {/* Total */}
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <span style={s.total}>
                      ${Number(v.total || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Estado */}
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span style={{ ...s.estadoBadge, backgroundColor: estadoMeta.bg, color: estadoMeta.color }}>
                      {estadoMeta.label}
                    </span>
                  </td>

                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={s.emptyCell}>
                  <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>💰</span>
                  No hay ventas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={s.pagination}>
          <button
            style={{ ...s.pageBtn, opacity: paginaActual === 1 ? 0.4 : 1 }}
            onClick={() => setPaginaActual(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>
          <span style={s.pageInfo}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            style={{ ...s.pageBtn, opacity: paginaActual === totalPaginas ? 0.4 : 1 }}
            onClick={() => setPaginaActual(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}

    </div>
  );
};

export default Ventas;

const s = {
  page: { padding: "24px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  headerSub: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },

  origenFiltros: { display: "flex", gap: "6px" },
  origenBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", fontSize: "12px", fontWeight: "500", color: "#64748b", cursor: "pointer" },
  origenBtnActive: { backgroundColor: "#3674B5", borderColor: "#3674B5", color: "white", fontWeight: "700" },
  origenCount: { fontSize: "11px", fontWeight: "700", backgroundColor: "#f1f5f9", color: "#64748b", padding: "1px 6px", borderRadius: "999px" },
  origenBadge: { fontSize: "12px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px" },

  // Stats
  statsRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  statCard: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px",
    border: "1px solid #e2e8f0",
  },
  statLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#0f172a" },

  // Controles
  controls: {
    display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
  },
  searchWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px" },
  searchInput: {
    width: "100%", padding: "9px 12px 9px 34px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", outline: "none", backgroundColor: "#fff",
  },
  resultCount: { fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" },

  // Tabla
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
  row: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },

  // Cliente
  clienteWrap: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    backgroundColor: "#EEF4FF", color: "#3674B5",
    fontSize: "13px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  clienteNombre: { fontWeight: "500", color: "#0f172a" },

  // Fecha
  fechaWrap: { display: "flex", flexDirection: "column", gap: "2px" },
  fecha: { fontSize: "13px", fontWeight: "500", color: "#0f172a" },
  hora: { fontSize: "11px", color: "#94a3b8" },

  // Método de pago
  metodoBadge: {
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "4px 10px", borderRadius: "8px",
    backgroundColor: "#f1f5f9", color: "#475569",
    fontSize: "12px", fontWeight: "500",
  },

  // Total
  total: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },

  // Estado
  estadoBadge: { display: "inline-block", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600" },

  emptyCell: {
    padding: "48px", textAlign: "center",
    color: "#94a3b8", fontSize: "14px",
  },

  // Paginación
  pagination: {
    display: "flex", justifyContent: "center", alignItems: "center",
    gap: "12px", marginTop: "20px",
  },
  pageBtn: {
    padding: "7px 18px", borderRadius: "8px",
    border: "1px solid #e2e8f0", backgroundColor: "#fff",
    cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#0f172a",
  },
  pageInfo: { fontSize: "13px", color: "#64748b", minWidth: "110px", textAlign: "center" },
};
