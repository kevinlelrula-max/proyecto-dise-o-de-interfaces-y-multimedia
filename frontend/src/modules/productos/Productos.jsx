import { useState, useEffect } from "react";
import TablaProductos from "./components/TablaProductos";
import FormProducto from "./components/FormProducto";
import Categorias from "./components/Categorias"; // ✅ nuevo
import useProductos from "./hooks/useProductos";

export default function Productos() {
  const { productos, agregar, eliminar, actualizar } = useProductos();

  // ✅ Pestaña activa
  const [pestana, setPestana] = useState("productos"); // "productos" | "categorias"

  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(12);
  const [vista, setVista] = useState("grid");

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const stockBajo = productos.filter((p) => p.stock < 10).length;

  useEffect(() => { setPaginaActual(1); }, [busqueda, productosPorPagina]);

  const handleNuevo = () => { setProductoEditar(null); setMostrarForm(true); };
  const handleEditar = (p) => { setProductoEditar(p); setMostrarForm(true); };

  const handleGuardar = async (formData) => {
    if (productoEditar) {
      await actualizar(productoEditar.id, formData);
    } else {
      await agregar(formData);
    }
    setMostrarForm(false);
    setProductoEditar(null);
  };

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}></span>
          <h2 style={s.headerTitle}>Gestión de Productos</h2>
        </div>
        {/* Botón solo visible en pestaña productos */}
        {pestana === "productos" && (
          <button style={s.btnNew} onClick={handleNuevo}>
            Nuevo Producto
          </button>
        )}
      </div>

      {/* ✅ PESTAÑAS */}
      <div style={s.tabs}>
        <button
          style={{ ...s.tab, ...(pestana === "productos" ? s.tabActive : {}) }}
          onClick={() => setPestana("productos")}
        >
          📦 Productos
        </button>
        <button
          style={{ ...s.tab, ...(pestana === "categorias" ? s.tabActive : {}) }}
          onClick={() => setPestana("categorias")}
        >
          🏷️ Categorías
        </button>
      </div>

      {/* ════ PESTAÑA PRODUCTOS ════ */}
      {pestana === "productos" && (
        <>
          {/* STAT CARDS */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total productos</span>
              <span style={{ ...s.statValue, color: "#3674B5" }}>{productos.length}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Mostrando</span>
              <span style={s.statValue}>{productosFiltrados.length}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>Stock bajo</span>
              <span style={{ ...s.statValue, color: stockBajo > 0 ? "#dc2626" : "#166534" }}>
                {stockBajo}
              </span>
            </div>
          </div>

          {/* CONTROLES */}
          <div style={s.controls}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}></span>
              <input
                style={s.searchInput}
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div style={s.controlsRight}>
              <div style={s.selectWrap}>
                <label style={s.selectLabel}>Mostrar:</label>
                <select
                  style={s.select}
                  value={productosPorPagina}
                  onChange={(e) => setProductosPorPagina(Number(e.target.value))}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div style={s.viewToggle}>
                <button
                  style={{ ...s.viewBtn, ...(vista === "grid" ? s.viewBtnActive : {}) }}
                  onClick={() => setVista("grid")}
                  title="Vista cuadrícula"
                >⊞</button>
                <button
                  style={{ ...s.viewBtn, ...(vista === "lista" ? s.viewBtnActive : {}) }}
                  onClick={() => setVista("lista")}
                  title="Vista lista"
                >☰</button>
              </div>
            </div>
          </div>

          {/* TABLA / GRID */}
          <TablaProductos
            productos={productosPaginados}
            onEliminar={eliminar}
            onEditar={handleEditar}
            vista={vista}
          />

          {/* PAGINACIÓN */}
          <div style={s.pagination}>
            <button
              style={{ ...s.pageBtn, opacity: paginaActual === 1 ? 0.4 : 1 }}
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
            >← Anterior</button>
            <span style={s.pageInfo}>
              Página {paginaActual} de {totalPaginas || 1}
            </span>
            <button
              style={{ ...s.pageBtn, opacity: (paginaActual === totalPaginas || totalPaginas === 0) ? 0.4 : 1 }}
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
            >Siguiente →</button>
          </div>
        </>
      )}

      {/* ════ PESTAÑA CATEGORÍAS ════ */}
      {pestana === "categorias" && <Categorias />}

      {/* MODAL */}
      {mostrarForm && (
        <FormProducto
          producto={productoEditar}
          onClose={() => setMostrarForm(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
}

const s = {
  page: { padding: "24px" },

  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerIcon: { fontSize: "22px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  btnNew: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "9px 20px", backgroundColor: "#3674B5",
    color: "white", border: "none", borderRadius: "10px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600",
  },

  // ✅ Pestañas
  tabs: {
    display: "flex", gap: "0",
    borderBottom: "2px solid #f0f0f0",
    marginBottom: "20px",
  },
  tab: {
    padding: "9px 20px",
    fontSize: "13px", fontWeight: "500",
    color: "#94a3b8", background: "none",
    border: "none", borderBottom: "2px solid transparent",
    cursor: "pointer", transition: "all 0.15s",
    marginBottom: "-2px", display: "flex", alignItems: "center", gap: "6px",
  },
  tabActive: {
    color: "#3674B5",
    borderBottomColor: "#3674B5",
  },

  // Stats
  statsRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  statCard: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px",
    border: "1px solid #e2e8f0",
  },
  statLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#0f172a" },

  // Controls
  controls: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px" },
  searchWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px" },
  searchInput: {
    width: "100%", padding: "9px 12px 9px 34px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", outline: "none",
    backgroundColor: "#fff",
  },
  controlsRight: { display: "flex", alignItems: "center", gap: "10px" },
  selectWrap: { display: "flex", alignItems: "center", gap: "6px" },
  selectLabel: { fontSize: "13px", color: "#64748b" },
  select: {
    padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0",
    fontSize: "13px", color: "#0f172a", backgroundColor: "#fff", cursor: "pointer",
  },
  viewToggle: { display: "flex", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" },
  viewBtn: {
    padding: "7px 12px", background: "transparent", border: "none",
    cursor: "pointer", fontSize: "16px", color: "#94a3b8", lineHeight: 1,
  },
  viewBtnActive: { backgroundColor: "#E1F5EE", color: "#3674B5" },

  // Paginación
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" },
  pageBtn: {
    padding: "7px 18px", borderRadius: "8px",
    border: "1px solid #e2e8f0", backgroundColor: "#fff",
    cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#0f172a",
  },
  pageInfo: { fontSize: "13px", color: "#64748b", minWidth: "110px", textAlign: "center" },
};