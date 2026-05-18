import { useNavigate } from "react-router-dom";
import logoWarefish from "../assets/logowarefish.png";

export default function TiendaInicio() {
  const navigate = useNavigate();
  const clienteNombre = localStorage.getItem("cliente_nombre");
  const clienteToken = localStorage.getItem("cliente_token");

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    navigate("/tienda");
  };

  return (
    <div style={s.page}>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navBrand} onClick={() => navigate("/tienda")}>
            <img src={logoWarefish} alt="WareFish Logo" style={{ width: 48, height: 48, objectFit: "contain" }} />
            <div>
              <span style={s.navBrandName}>Pesquera Estrada</span>
              <span style={s.navBrandSub}>Tienda online</span>
            </div>
          </div>

          <div style={s.navLinks}>
            <button style={{ ...s.navLink, ...s.navLinkActive }}>Inicio</button>
            <button style={s.navLink} onClick={() => navigate("/tienda/catalogo")}>Catálogo</button>
            <button style={s.navLink} onClick={() => navigate("/tienda/contacto")}>Contacto</button>
          </div>

          <div style={s.navActions}>
            <button style={s.navBtnBack} onClick={() => navigate("/")}>← Sitio principal</button>
            {clienteToken ? (
              <>
                <button style={s.navBtnGhost} onClick={() => navigate("/tienda/mis-pedidos")}>📦 Mis pedidos</button>
                <button style={s.navBtnGhost} onClick={() => navigate("/tienda/perfil")}>👤 Mi perfil</button>
                <div style={s.navUser}>
                  <div style={s.navAvatar}>{clienteNombre?.[0]?.toUpperCase() ?? "C"}</div>
                  <span style={s.navUserName}>{clienteNombre}</span>
                  <button style={s.navBtnSalir} onClick={handleCerrarSesion}>Salir</button>
                </div>
              </>
            ) : (
              <>
                <button style={s.navBtnGhost} onClick={() => navigate("/tienda/login")}>Iniciar sesión</button>
                <button style={s.navBtnPrimary} onClick={() => navigate("/tienda/registro")}>Registrarse</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroText}>
            <div style={s.heroBadge}>🐟 Pesquera Estrada</div>
            <h1 style={s.heroTitle}>El mejor pescado fresco<br /><span style={s.heroAccent}>directo del mar a tu mesa</span></h1>
            <p style={s.heroSubtitle}>
              Más de 20 años llevando el mejor pescado fresco de la región directamente a tu hogar. Sin intermediarios, con la frescura garantizada.
            </p>
            <div style={s.heroBtns}>
              <button style={s.heroBtnPrimary} onClick={() => navigate("/tienda/catalogo")}>
                Ver catálogo →
              </button>
              <button style={s.heroBtnOutline} onClick={() => navigate("/tienda/contacto")}>
                Contáctanos
              </button>
            </div>
          </div>
        </div>
        <div style={s.heroGlow1} />
        <div style={s.heroGlow2} />
      </section>

      {/* ── STATS ── */}
      <section style={s.stats}>
        <div style={s.statsInner}>
          {[
            { num: "+20", label: "Años de experiencia" },
            { num: "+50", label: "Especies disponibles" },
            { num: "100%", label: "Producto fresco" },
            { num: "24/7", label: "Pedidos en línea" },
          ].map((st, i) => (
            <div key={i} style={s.statItem}>
              <span style={s.statNum}>{st.num}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOBRE NOSOTROS ── */}
      <section style={s.about}>
        <div style={s.aboutInner}>
          <div style={s.aboutText}>
            <span style={s.sectionTag}>¿Quiénes somos?</span>
            <h2 style={s.sectionTitle}>Pesquera Estrada,<br />tradición y calidad</h2>
            <p style={s.sectionDesc}>
              Somos una empresa familiar con más de dos décadas de experiencia en la comercialización de productos del mar. Trabajamos directamente con pescadores artesanales para garantizar la frescura y calidad de cada producto.
            </p>
            <p style={s.sectionDesc}>
              Nuestro compromiso es llevar el mejor pescado de la región a tu hogar, con la comodidad de comprar desde donde estés.
            </p>
            <button style={s.aboutBtn} onClick={() => navigate("/tienda/catalogo")}>
              Ver nuestros productos →
            </button>
          </div>
          <div style={s.aboutFeatures}>
            {[
              { icon: "🚚", title: "Entrega a domicilio", desc: "Recibe tu pedido fresco en la puerta de tu casa." },
              { icon: "✅", title: "Calidad garantizada", desc: "Todos nuestros productos pasan por control de calidad." },
              { icon: "💳", title: "Pago seguro", desc: "Acepta tarjeta de crédito, débito y efectivo." },
              { icon: "📦", title: "Seguimiento de pedido", desc: "Rastrea tu pedido en tiempo real desde la app." },
            ].map((f, i) => (
              <div key={i} style={s.featureCard}>
                <span style={s.featureIcon}>{f.icon}</span>
                <div>
                  <h4 style={s.featureTitle}>{f.title}</h4>
                  <p style={s.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>¿Listo para pedir?</h2>
          <p style={s.ctaDesc}>Explora nuestro catálogo y recibe pescado fresco en tu hogar.</p>
          <button style={s.ctaBtn} onClick={() => navigate("/tienda/catalogo")}>
            Ir al catálogo →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <img src={logoWarefish} alt="WareFish" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span style={s.footerBrandName}>Pesquera Estrada</span>
          </div>
          <span style={s.footerCopy}>© 2026 WareFish · Pesquera Estrada</span>
        </div>
      </footer>

    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" },

  // Navbar
  nav: { position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(15,23,42,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  navInner: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", gap: "16px" },
  navBrand: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", flexShrink: 0 },
  navBrandName: { fontSize: "16px", fontWeight: "700", color: "white", display: "block", lineHeight: 1.1, letterSpacing: "-0.02em" },
  navBrandSub: { fontSize: "10px", color: "#34d399", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", display: "block" },
  navLinks: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  navLink: { padding: "6px 14px", background: "transparent", border: "none", borderRadius: "8px", color: "rgba(255,255,255,0.75)", fontSize: "14px", cursor: "pointer", fontWeight: "500" },
  navLinkActive: { color: "white", backgroundColor: "rgba(255,255,255,0.1)", fontWeight: "600" },
  navActions: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" },
  navBtnBack: { padding: "6px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.45)", fontSize: "12px", cursor: "pointer", fontWeight: "400" },
  navBtnGhost: { padding: "7px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
  navBtnPrimary: { padding: "7px 16px", backgroundColor: "#3674B5", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", cursor: "pointer", fontWeight: "600" },
  navBtnSalir: { background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "12px", cursor: "pointer", padding: "0 4px" },
  navUser: { display: "flex", alignItems: "center", gap: "8px", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)" },
  navAvatar: { width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#3674B5", color: "white", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  navUserName: { fontSize: "13px", color: "white", fontWeight: "500" },

  // Hero
  hero: { background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 60%, #0f1f2e 100%)", padding: "100px 32px", position: "relative", overflow: "hidden" },
  heroInner: { maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 },
  heroText: { maxWidth: "620px" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399", fontSize: "13px", fontWeight: "500", marginBottom: "20px", backgroundColor: "rgba(52,211,153,0.08)" },
  heroTitle: { fontSize: "52px", fontWeight: "800", color: "white", lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "20px" },
  heroAccent: { color: "#34d399" },
  heroSubtitle: { fontSize: "17px", color: "rgba(255,255,255,0.65)", lineHeight: "1.7", marginBottom: "36px" },
  heroBtns: { display: "flex", gap: "12px", flexWrap: "wrap" },
  heroBtnPrimary: { padding: "14px 32px", backgroundColor: "#3674B5", border: "none", borderRadius: "10px", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  heroBtnOutline: { padding: "14px 32px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", color: "white", fontSize: "15px", cursor: "pointer" },
  heroGlow1: { position: "absolute", top: "-100px", right: "0", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,110,86,0.2) 0%, transparent 70%)", pointerEvents: "none" },
  heroGlow2: { position: "absolute", bottom: "-100px", left: "20%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)", pointerEvents: "none" },

  // Stats
  stats: { backgroundColor: "#0f172a", padding: "0 32px" },
  statsInner: { maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid rgba(255,255,255,0.08)" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px", gap: "4px", borderRight: "1px solid rgba(255,255,255,0.08)" },
  statNum: { fontSize: "32px", fontWeight: "800", color: "#34d399" },
  statLabel: { fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center" },

  // About
  about: { backgroundColor: "white", padding: "80px 32px" },
  aboutInner: { maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" },
  aboutText: {},
  sectionTag: { fontSize: "12px", fontWeight: "700", color: "#3674B5", textTransform: "uppercase", letterSpacing: "0.08em" },
  sectionTitle: { fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", margin: "12px 0 20px", lineHeight: "1.2" },
  sectionDesc: { fontSize: "15px", color: "#64748b", lineHeight: "1.7", marginBottom: "16px" },
  aboutBtn: { marginTop: "8px", padding: "12px 24px", backgroundColor: "#3674B5", border: "none", borderRadius: "10px", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  aboutFeatures: { display: "flex", flexDirection: "column", gap: "20px" },
  featureCard: { display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
  featureIcon: { fontSize: "28px", flexShrink: 0 },
  featureTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  featureDesc: { fontSize: "13px", color: "#64748b", lineHeight: "1.5" },

  // CTA
  cta: { background: "linear-gradient(135deg, #3674B5 0%, #1e40af 100%)", padding: "72px 32px" },
  ctaInner: { maxWidth: "1200px", margin: "0 auto", textAlign: "center" },
  ctaTitle: { fontSize: "36px", fontWeight: "800", color: "white", marginBottom: "12px", letterSpacing: "-0.02em" },
  ctaDesc: { fontSize: "16px", color: "rgba(255,255,255,0.75)", marginBottom: "32px" },
  ctaBtn: { padding: "14px 36px", backgroundColor: "white", color: "#3674B5", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },

  // Footer
  footer: { backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 32px" },
  footerInner: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerBrand: { display: "flex", alignItems: "center", gap: "8px" },
  footerBrandName: { fontSize: "14px", fontWeight: "600", color: "white" },
  footerCopy: { fontSize: "12px", color: "rgba(255,255,255,0.3)" },
};
