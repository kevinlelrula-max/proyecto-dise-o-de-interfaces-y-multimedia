import { useState, useEffect } from "react";
import useClientes from "./hooks/useClientes";
import TablaClientes from "./components/TablaClientes";
import FormCliente from "./components/FormCliente";

export default function Clientes() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useClientes();

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina, setClientesPorPagina] = useState(10);

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexUltimo = paginaActual * clientesPorPagina;
  const indexPrimero = indexUltimo - clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

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
  };

  const handleNuevo = () => {
    setClienteSeleccionado(null);
    setMostrarForm(true);
  };

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}></span>
          <h2 style={s.headerTitle}>Clientes</h2>
        </div>
        <button style={s.btnNew} onClick={handleNuevo}>
          + Nuevo Cliente
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total clientes</span>
          <span style={{ ...s.statValue, color: "#2563eb" }}>{clientes.length}</span>
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

      {/* TABLA */}
      <TablaClientes
        clientes={clientesPaginados}
        onEditar={handleEditar}
        onEliminar={borrarCliente}
      />

      {/* PAGINACIÓN */}
      <div style={s.pagination}>
        <button
          style={{ ...s.pageBtn, opacity: paginaActual === 1 ? 0.4 : 1 }}
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          ← Anterior
        </button>
        <span style={s.pageInfo}>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
        <button
          style={{ ...s.pageBtn, opacity: (paginaActual === totalPaginas || totalPaginas === 0) ? 0.4 : 1 }}
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
        >
          Siguiente →
        </button>
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
  );
}

const s = {
  page: { padding: "24px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerIcon: { fontSize: "22px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  btnNew: {
    padding: "9px 20px", backgroundColor: "#2563eb",
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

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" },
  pageBtn: {
    padding: "7px 18px", borderRadius: "8px",
    border: "1px solid #e2e8f0", backgroundColor: "#fff",
    cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#0f172a",
  },
  pageInfo: { fontSize: "13px", color: "#64748b", minWidth: "110px", textAlign: "center" },

  // Modal
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
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  modalClose: {
    background: "none", border: "none", fontSize: "16px",
    cursor: "pointer", color: "#94a3b8", padding: "4px",
  },
};
