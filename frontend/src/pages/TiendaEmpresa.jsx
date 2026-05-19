import { useNavigate, useParams, useLocation, useRef, useEffect, useState } from "react";
import { useTiendaEmpresa } from "./useTiendaEmpresa";
import CatalogoGrid from "./CatalogoGrid";
import Carrito from "./Carrito";

export default function TiendaEmpresa() {
  const navigate  = useNavigate();
  const { empresaSlug } = useParams();
  const location  = useLocation();

  // La empresa puede venir por state (desde el marketplace) o hay que buscarla
  const empresa = location.state?.empresa || null;
  const empresaId   = empresa?.id;
  const empresaNombre = empresa?.nombre || empresaSlug;

  const {
    // Productos
    productos, loadingProds, busqueda, setBusqueda,
    // Carrito
    carrito, carritoAbierto, setCarritoAbierto,
    agregarAlCarrito, cambiarKilos, quitarDelCarrito,
    vaciarCarrito, totalItems, totalPrecio,
    // Pedido
    metodosPago, metodoPagoId, setMetodoPagoId,
    direccion, setDireccion, notas, setNotas,
    loadingPedido, errorPedido, setErrorPedido,
    pedidoExitoso, confirmarPedido, cerrarExito,
    // Auth
    estaLogueado, clienteNombre,
  } = useTiendaEmpresa(empresaId, empresaSlug);

  // Animación del carrito al añadir items
  const prevTotalItems = useRef(totalItems);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  useEffect(() => {
    if (totalItems > prevTotalItems.current) {
      setCartBumpKey(k => k + 1);
    }
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    navigate("/tienda");
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes cartBump {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.5); }
          55%  { transform: scale(0.9); }
          75%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes cartBtnPop {
          0%   { box-shadow: 0 0 0 0px rgba(54,116,181,0.6); }
          100% { box-shadow: 0 0 0 10px rgba(54,116,181,0); }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>

          {/* Breadcrumb: Tienda > Empresa */}
          <div style={s.navBread}>
            <button style={s.navBreadBtn} onClick={() => navigate("/tienda")}>
              🛒 Tienda
            </button>
            <span style={s.navBreadSep}>›</span>
            <span style={s.navBreadCurrent}>{empresaNombre}</span>
          </div>

          {/* Buscador */}
          <div style={s.navSearch}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
            </svg>
            <input
              style={s.navSearchInput}
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button style={s.clearBtn} onClick={() => setBusqueda("")}>✕</button>
            )}
          </div>

          {/* Acciones */}
          <div style={s.navActions}>
            {estaLogueado ? (
              <>
                <button style={s.navBtnGhost} onClick={() => navigate("/tienda/mis-pedidos")}>
                  📦 Mis pedidos
                </button>
                <span style={s.navUserName}>{clienteNombre}</span>
                <button style={s.navBtnSalir} onClick={handleCerrarSesion}>Salir</button>
              </>
            ) : (
              <>
                <button style={s.navBtnGhost} onClick={() => navigate("/tienda/login", { state: { from: location.pathname } })}>
                  Iniciar sesión
                </button>
                <button style={s.navBtnPrimary} onClick={() => navigate("/tienda/registro", { state: { empresa_id: empresaId } })}>
                  Registrarse
                </button>
              </>
            )}

            {/* Botón carrito */}
            <button
              style={{
                ...s.carritoBtn,
                backgroundColor: carrito.length > 0 ? "#3674B5" : "rgba(255,255,255,0.1)",
              }}
              onClick={() => setCarritoAbierto(true)}
            >
              🛒
              {carrito.length > 0 && (
                <span
                  key={cartBumpKey}
                  style={{
                    ...s.carritoBadge,
                    animation: "cartBump 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  {carrito.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO empresa ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroAvatar}>
            {empresaNombre?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={s.heroTitle}>{empresaNombre}</h1>
            <p style={s.heroSub}>
              {empresa?.telefono && `📞 ${empresa.telefono} · `}
              {empresa?.nit && `NIT ${empresa.nit}`}
            </p>
          </div>
          <div style={s.heroBadge}>
            <span style={s.heroDot} /> Online
          </div>
        </div>
        <div style={s.heroGlow} />
      </div>

      {/* ── CONTENIDO ── */}
      <div style={s.content}>

        {/* Header resultado */}
        <div style={s.resultsHeader}>
          <span style={s.resultsCount}>
            {loadingProds
              ? "Cargando productos..."
              : `${productos.length} producto${productos.length !== 1 ? "s" : ""} disponible${productos.length !== 1 ? "s" : ""}`}
          </span>
          {busqueda && (
            <span style={s.resultsBusqueda}>
              Resultados para <strong>"{busqueda}"</strong>
            </span>
          )}
        </div>

        {/* Grid */}
        <CatalogoGrid
          productos={productos}
          loading={loadingProds}
          busqueda={busqueda}
          onAgregar={agregarAlCarrito}
        />
      </div>

      {/* ── CARRITO lateral ── */}
      <Carrito
        carrito={carrito}
        carritoAbierto={carritoAbierto}
        setCarritoAbierto={setCarritoAbierto}
        cambiarKilos={cambiarKilos}
        quitarDelCarrito={quitarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        totalItems={totalItems}
        totalPrecio={totalPrecio}
        metodosPago={metodosPago}
        metodoPagoId={metodoPagoId}
        setMetodoPagoId={setMetodoPagoId}
        direccion={direccion}
        setDireccion={setDireccion}
        notas={notas}
        setNotas={setNotas}
        loadingPedido={loadingPedido}
        errorPedido={errorPedido}
        setErrorPedido={setErrorPedido}
        confirmarPedido={confirmarPedido}
        estaLogueado={estaLogueado}
      />

      {/* ── MODAL PEDIDO EXITOSO ── */}
      {pedidoExitoso && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>🎉</div>
            <h2 style={s.modalTitle}>¡Pedido enviado!</h2>
            <p style={s.modalDesc}>
              Tu pedido <strong>#{pedidoExitoso.id}</strong> fue recibido por {empresaNombre}.
              Te contactarán pronto para coordinar la entrega.
            </p>
            <p style={s.modalTotal}>
              Total: <strong>${pedidoExitoso.total.toLocaleString("es-CO")}</strong>
            </p>
            <button style={s.modalBtn} onClick={cerrarExito}>
              Ver mis pedidos
            </button>
            <button style={s.modalBtnSecondary} onClick={() => { cerrarExito(); navigate(`/tienda/${empresaSlug}`); }}>
              Seguir comprando
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={s.footerText}>© 2026 WareFish · Marketplace</span>
        <button style={s.footerBack} onClick={() => navigate("/tienda")}>
          ← Volver al marketplace
        </button>
      </footer>

    </div>
  );
}

/* ─── ESTILOS ─── */
const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  // Navbar
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1300px", margin: "0 auto",
    padding: "0 24px", height: "60px",
    display: "flex", alignItems: "center", gap: "16px",
  },
  navBread: { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 },
  navBreadBtn: {
    background: "none", border: "none",
    color: "rgba(255,255,255,0.5)", fontSize: "13px",
    cursor: "pointer", padding: "0",
    transition: "color 0.2s",
  },
  navBreadSep: { color: "rgba(255,255,255,0.25)", fontSize: "13px" },
  navBreadCurrent: {
    fontSize: "13px", fontWeight: "600",
    color: "white", maxWidth: "180px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  navSearch: {
    flex: 1, maxWidth: "360px",
    display: "flex", alignItems: "center", gap: "8px",
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "0 14px", height: "36px",
  },
  navSearchInput: {
    flex: 1, background: "none", border: "none",
    outline: "none", fontSize: "13px", color: "white",
  },
  clearBtn: {
    background: "none", border: "none",
    color: "#64748b", cursor: "pointer", fontSize: "11px",
  },
  navActions: {
    marginLeft: "auto", display: "flex",
    alignItems: "center", gap: "8px", flexShrink: 0,
  },
  navBtnGhost: {
    padding: "6px 12px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
    color: "rgba(255,255,255,0.8)", fontSize: "12px",
    cursor: "pointer", fontWeight: "500",
  },
  navBtnPrimary: {
    padding: "6px 14px", backgroundColor: "#3674B5",
    border: "none", borderRadius: "8px",
    color: "white", fontSize: "12px",
    cursor: "pointer", fontWeight: "600",
  },
  navUserName: { fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  navBtnSalir: {
    background: "none", border: "none",
    color: "#64748b", fontSize: "12px", cursor: "pointer",
  },
  carritoBtn: {
    position: "relative",
    width: "38px", height: "38px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: "16px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s",
  },
  carritoBadge: {
    position: "absolute", top: "-6px", right: "-6px",
    width: "18px", height: "18px", borderRadius: "50%",
    backgroundColor: "#ef4444", color: "white",
    fontSize: "10px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Hero
  hero: {
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 60%, #0f1f2e 100%)",
    padding: "32px 24px",
    position: "relative", overflow: "hidden",
  },
  heroInner: {
    maxWidth: "1300px", margin: "0 auto",
    display: "flex", alignItems: "center", gap: "20px",
    position: "relative", zIndex: 1,
  },
  heroAvatar: {
    width: "56px", height: "56px", borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "white", fontSize: "18px", fontWeight: "800",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, letterSpacing: "-0.02em",
  },
  heroTitle: {
    fontSize: "26px", fontWeight: "800",
    color: "white", letterSpacing: "-0.02em",
    margin: 0, lineHeight: 1.2,
  },
  heroSub: { fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" },
  heroBadge: {
    marginLeft: "auto",
    display: "flex", alignItems: "center", gap: "6px",
    backgroundColor: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: "999px", padding: "5px 12px",
    fontSize: "12px", fontWeight: "600", color: "#34d399",
    flexShrink: 0,
  },
  heroDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    backgroundColor: "#34d399", display: "inline-block",
  },
  heroGlow: {
    position: "absolute", top: "-80px", right: "-80px",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(15,110,86,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  // Contenido
  content: {
    flex: 1,
    maxWidth: "1300px", margin: "0 auto",
    padding: "28px 24px", width: "100%",
    boxSizing: "border-box",
  },
  resultsHeader: {
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "20px",
  },
  resultsCount: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  resultsBusqueda: { fontSize: "13px", color: "#64748b" },

  // Modal éxito
  modalOverlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(15,23,42,0.7)",
    zIndex: 300, display: "flex",
    alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "white", borderRadius: "20px",
    padding: "40px 36px", maxWidth: "400px", width: "90%",
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
  },
  modalIcon: { fontSize: "52px", marginBottom: "16px" },
  modalTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" },
  modalDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "12px" },
  modalTotal: { fontSize: "18px", color: "#3674B5", marginBottom: "24px" },
  modalBtn: {
    width: "100%", padding: "13px",
    backgroundColor: "#3674B5", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700",
    cursor: "pointer", marginBottom: "10px",
  },
  modalBtnSecondary: {
    width: "100%", padding: "11px",
    background: "transparent", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", cursor: "pointer",
  },

  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "white", padding: "14px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: "12px", color: "#94a3b8" },
  footerBack: {
    background: "none", border: "none",
    color: "#3674B5", fontSize: "12px",
    fontWeight: "600", cursor: "pointer",
  },
};
