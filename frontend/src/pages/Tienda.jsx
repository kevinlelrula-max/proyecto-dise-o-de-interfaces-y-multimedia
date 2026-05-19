import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductosTienda } from "../modules/tienda/hooks/useProductosTienda";
import { useCarrito } from "../modules/tienda/hooks/useCarrito";
import CarritoPanel from "../modules/tienda/components/CarritoPanel";
import logoWarefish from "../assets/logowarefish.png";
import ModalPedido from "../modules/tienda/components/ModalPedido";

// Colores de avatar por inicial
const AVATAR_COLORS = [
  { bg: "#EEF4FF", color: "#3674B5" },
  { bg: "#eff6ff", color: "#1e40af" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#fffbeb", color: "#b45309" },
  { bg: "#ecfeff", color: "#0e7490" },
  { bg: "#fdf2f8", color: "#be185d" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#f0fdf4", color: "#166534" },
];

function getAvatarColor(nombre) {
  const idx = nombre.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getIniciales(nombre) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Tienda() {
  const navigate = useNavigate();

  // 🟢 DATA
  const { productos, cargando } = useProductosTienda();
  const carrito = useCarrito();

  // 🟢 UI STATE
  const [busqueda, setBusqueda] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // 🔥 MODAL PEDIDO
  const [mostrarPedido, setMostrarPedido] = useState(false);

  const clienteNombre = localStorage.getItem("cliente_nombre");
  const clienteToken = localStorage.getItem("cliente_token");

  // 🔎 FILTRO
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    navigate("/tienda");
  };

  // ─────────────────────────────
  // 🔥 PEDIDO (FIX PRINCIPAL)
  // ─────────────────────────────
  const handlePedido = () => {
    // ✔️ validar login antes de todo
    if (!clienteToken) {
      setCarritoAbierto(false);
      navigate("/tienda/login");
      return;
    }

    // cerrar carrito y abrir checkout
    setCarritoAbierto(false);
    setMostrarPedido(true);
  };

  // ✔️ cuando pedido se hace correctamente
  const handleExitoPedido = () => {
    carrito.vaciar();
    setMostrarPedido(false);
  };

  return (
    <div style={s.page}>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>

          {/* BRAND */}
          <div style={s.navBrand} onClick={() => navigate("/")}>
            <img src={logoWarefish} alt="WareFish Logo" style={{ width: 48, height: 48, objectFit: "contain" }} />
            <div>
              <span style={s.navBrandName}>WareFish</span>
              <span style={s.navBrandSub}>Tienda</span>
            </div>
          </div>

          {/* NAV LINKS */}
          <div style={s.navLinks}>
            <button style={s.navLink} onClick={() => navigate("/tienda")}>Inicio</button>
            <button style={{ ...s.navLink, ...s.navLinkActive }}>Catálogo</button>
            <button style={s.navLink} onClick={() => navigate("/tienda/contacto")}>Contacto</button>
          </div>

          {/* SEARCH */}
          <div style={s.navSearch}>
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

          {/* ACTIONS */}
          <div style={s.navActions}>

            <button style={s.navBtnBack} onClick={() => navigate("/")}>← Sitio principal</button>

            {/* 🛒 CARRITO */}
            <button
              style={s.navBtnGhost}
              onClick={() => setCarritoAbierto(true)}
            >
              🛒 {carrito.cantidad}
            </button>

            {clienteToken ? (
              <>
                <button
                  style={s.navBtnGhost}
                  onClick={() => navigate("/tienda/mis-pedidos")}
                >
                  📦 Mis pedidos
                </button>

                <button
                  style={s.navBtnGhost}
                  onClick={() => navigate("/tienda/perfil")}
                >
                  👤 Mi perfil
                </button>

                <div style={s.navUser}>
                  <div style={s.navAvatar}>
                    {clienteNombre?.[0]?.toUpperCase() ?? "C"}
                  </div>
                  <span style={s.navUserName}>{clienteNombre}</span>
                  <button style={s.navBtnSalir} onClick={handleCerrarSesion}>
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  style={s.navBtnGhost}
                  onClick={() => navigate("/tienda/login")}
                >
                  Iniciar sesión
                </button>
                <button
                  style={s.navBtnPrimary}
                  onClick={() => navigate("/tienda/registro")}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>🛒 Catálogo de productos</div>
          <h1 style={s.heroTitle}>Compra pescado fresco</h1>
          <p style={s.heroSubtitle}>Directo desde productores, sin intermediarios.</p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div id="productos-section" style={s.content}>

        {cargando ? (
          <p style={{ color: "#64748b" }}>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>🔍</span>
            <p style={s.emptyTitle}>No encontramos productos</p>
            <p style={s.emptyDesc}>Intenta otra búsqueda</p>
            <button style={s.emptyBtn} onClick={() => setBusqueda("")}>
              Ver todos
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {productosFiltrados.map((producto) => {
              const { bg, color } = getAvatarColor(producto.nombre);
              const iniciales = getIniciales(producto.nombre);
              const isHovered = hoveredId === producto.id;

              const imgSrc = producto.imagen_url
                ? producto.imagen_url.startsWith("http")
                  ? producto.imagen_url
                  : `${API_BASE}${producto.imagen_url}`
                : null;

              return (
                <div
                  key={producto.id}
                  style={{
                    ...s.card,
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  }}
                  onMouseEnter={() => setHoveredId(producto.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* imagen o avatar */}
                  <div style={s.imgWrap}>
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={producto.nombre}
                        style={s.img}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div style={{ ...s.avatar, backgroundColor: bg, color, display: imgSrc ? "none" : "flex" }}>
                      {iniciales}
                    </div>
                  </div>

                  <div style={s.cardBody}>
                    <div style={s.cardInfo}>
                      <h3 style={s.cardNombre}>{producto.nombre}</h3>
                      <p style={s.cardTel}>💰 ${Number(producto.precio).toLocaleString("es-CO")}/kg</p>
                      <p style={s.cardNit}>Stock: {producto.stock ?? "N/A"} kg</p>
                    </div>

                    <div style={s.cardFooter}>
                      <div style={s.onlineBadge}>🟢 Disponible</div>
                      <button
                        style={{
                          ...s.cardBtn,
                          backgroundColor: isHovered ? color : "transparent",
                          color: isHovered ? "white" : color,
                          borderColor: color,
                        }}
                        onClick={() => carrito.agregar(producto)}
                        disabled={producto.stock === 0}
                      >
                        {producto.stock === 0 ? "Agotado" : "Agregar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CARRITO PANEL ── */}
      <CarritoPanel
        items={carrito.items}
        total={carrito.total}
        onCambiarKilos={carrito.cambiarKilos}
        onEliminar={carrito.eliminar}
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        onPedido={handlePedido}
      />

      {/* ── MODAL PEDIDO ── */}
      {mostrarPedido && (
        <ModalPedido
          items={carrito.items}
          total={carrito.total}
          onCerrar={() => setMostrarPedido(false)}
          onExito={handleExitoPedido}
        />
      )}

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
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  navBrandName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    display: "block",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  navBrandSub: {
    fontSize: "10px",
    color: "#34d399",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
  },
  navLinks: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  navLink: {
    padding: "6px 14px", background: "transparent", border: "none",
    borderRadius: "8px", color: "rgba(255,255,255,0.75)", fontSize: "14px",
    cursor: "pointer", fontWeight: "500",
  },
  navLinkActive: { color: "white", backgroundColor: "rgba(255,255,255,0.1)", fontWeight: "600" },
  navSearch: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "0 14px",
    height: "38px",
    maxWidth: "400px",
  },
  navSearchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "white",
    "::placeholder": { color: "#64748b" },
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "12px",
    padding: "0",
    lineHeight: 1,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    marginLeft: "auto",
  },
  navBtnBack: { padding: "6px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.45)", fontSize: "12px", cursor: "pointer", fontWeight: "400" },
  navBtnGhost: {
    padding: "7px 14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  navBtnPrimary: {
    padding: "7px 16px",
    backgroundColor: "#3674B5",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "600",
  },
  navUser: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#3674B5",
    color: "white",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navUserName: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  navBtnSalir: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
    padding: "0",
  },

  // Hero
  hero: {
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 60%, #0f1f2e 100%)",
    padding: "48px 24px",
    position: "relative",
    overflow: "hidden",
  },
  heroInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "rgba(52,211,153,0.08)",
    marginBottom: "14px",
    letterSpacing: "0.02em",
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "white",
    letterSpacing: "-0.03em",
    marginBottom: "10px",
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1.6",
    maxWidth: "560px",
    marginBottom: "28px",
  },
  heroBtns: { display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap" },
  heroBtnPrimary: {
    padding: "12px 28px", backgroundColor: "#3674B5", border: "none",
    borderRadius: "10px", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
  heroBtnOutline: {
    padding: "12px 28px", backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px",
    color: "white", fontSize: "15px", cursor: "pointer",
  },
  heroAccent: { color: "#34d399" },
  heroStats: {
    display: "flex", alignItems: "center", gap: "32px",
    paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  heroStat: { display: "flex", flexDirection: "column", gap: "4px" },
  heroStatNum: { fontSize: "28px", fontWeight: "800", color: "white" },
  heroStatLabel: { fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  heroStatDivider: { width: "1px", height: "40px", backgroundColor: "rgba(255,255,255,0.15)" },

  // Contacto
  contacto: {
    backgroundColor: "#0f172a",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "56px 32px 24px",
    marginTop: "auto",
  },
  contactoInner: {
    maxWidth: "1200px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr",
    gap: "48px", paddingBottom: "40px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  contactoLeft: { display: "flex", flexDirection: "column" },
  contactoTitle: { fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "10px", letterSpacing: "-0.02em" },
  contactoDesc: { fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: "1.7", maxWidth: "280px" },
  contactoSubtitle: { fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em" },
  contactoInfo: { display: "flex", flexDirection: "column", gap: "12px" },
  contactoItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.5" },
  contactoCopy: { maxWidth: "1200px", margin: "0 auto", paddingTop: "24px", fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center" },
  heroGlow1: {
    position: "absolute", top: "-100px", right: "-100px",
    width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(15,110,86,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute", bottom: "-80px", left: "30%",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  // Contenido
  content: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    width: "100%",
    boxSizing: "border-box",
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  resultsCount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  resultsBusqueda: {
    fontSize: "13px",
    color: "#64748b",
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },

  // Card
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    transition: "all 0.22s ease",
    cursor: "default",
    display: "flex",
    flexDirection: "column",
  },
  imgWrap: {
    width: "100%",
    height: "140px",
    background: "#f0f7f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBar: {
    height: "4px",
    width: "100%",
  },
  cardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },
  cardInfo: {},
  cardNombre: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  cardTel: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "2px",
  },
  cardNit: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "4px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },
  onlineBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#3674B5",
  },
  onlineDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#3674B5",
    boxShadow: "0 0 0 2px rgba(54,116,181,0.2)",
  },
  cardBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1.5px solid",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  // Skeleton
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  skeleton: {
    height: "200px",
    borderRadius: "16px",
    backgroundColor: "#e2e8f0",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  // Empty state
  empty: {
    textAlign: "center",
    padding: "80px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  emptyDesc: { fontSize: "14px", color: "#64748b" },
  emptyBtn: {
    marginTop: "8px",
    padding: "10px 20px",
    backgroundColor: "#3674B5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "white",
    padding: "16px 24px",
  },
  footerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  footerEmpresa: {
    background: "none",
    border: "none",
    color: "#3674B5",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
};