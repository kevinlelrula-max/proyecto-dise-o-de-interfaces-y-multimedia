import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoWarefish from "../assets/logowarefish.png";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;
const EMPRESA_ID = 1;

export default function TiendaContacto() {
  const navigate = useNavigate();
  const clienteNombre = localStorage.getItem("cliente_nombre");
  const clienteToken = localStorage.getItem("cliente_token");

  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", asunto: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    navigate("/tienda");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEnviar = async () => {
    if (!form.nombre.trim() || !form.mensaje.trim()) {
      setError("El nombre y el mensaje son obligatorios.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id: EMPRESA_ID, ...form }),
      });
      if (!res.ok) throw new Error();
      setExito(true);
      setForm({ nombre: "", apellido: "", email: "", asunto: "", mensaje: "" });
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
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
            <button style={s.navLink} onClick={() => navigate("/tienda")}>Inicio</button>
            <button style={s.navLink} onClick={() => navigate("/tienda/catalogo")}>Catálogo</button>
            <button style={{ ...s.navLink, ...s.navLinkActive }}>Contacto</button>
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
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>📍 Encuéntranos</div>
          <h1 style={s.heroTitle}>Contáctanos</h1>
          <p style={s.heroSubtitle}>Estamos aquí para atenderte. Escríbenos o visítanos.</p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <section style={s.content}>
        <div style={s.contentInner}>

          {/* Info de contacto */}
          <div style={s.infoCol}>
            <h2 style={s.infoTitle}>Información de contacto</h2>
            <p style={s.infoDesc}>Puedes comunicarte con nosotros por cualquiera de estos medios. Estamos disponibles para ayudarte.</p>

            <div style={s.infoCards}>
              {[
                { icon: "📍", title: "Dirección", lines: ["Carrera 15 #45-32", "Buenaventura, Valle del Cauca"] },
                { icon: "📞", title: "Teléfono", lines: ["(+57) 312 345 6789", "(+57) 2 234 5678"] },
                { icon: "✉️", title: "Correo electrónico", lines: ["contacto@pesqueraestrada.com", "ventas@pesqueraestrada.com"] },
                { icon: "🕐", title: "Horario de atención", lines: ["Lunes a Viernes: 6:00 AM – 6:00 PM", "Sábados: 6:00 AM – 2:00 PM"] },
              ].map((item, i) => (
                <div key={i} style={s.infoCard}>
                  <span style={s.infoCardIcon}>{item.icon}</span>
                  <div>
                    <h4 style={s.infoCardTitle}>{item.title}</h4>
                    {item.lines.map((l, j) => (
                      <p key={j} style={s.infoCardLine}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div style={s.formCol}>
            <h2 style={s.infoTitle}>Envíanos un mensaje</h2>
            <p style={s.infoDesc}>¿Tienes preguntas sobre tus pedidos o nuestros productos? Cuéntanos.</p>

            <div style={s.form}>
              {exito && (
                <div style={s.successBox}>✅ ¡Mensaje enviado! Te responderemos a la brevedad.</div>
              )}
              {error && (
                <div style={s.errorBox}>{error}</div>
              )}
              <div style={s.formRow}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Nombre</label>
                  <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Apellido</label>
                  <input style={s.input} name="apellido" value={form.apellido} onChange={handleChange} placeholder="Tu apellido" />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Correo electrónico</label>
                <input style={s.input} name="email" value={form.email} onChange={handleChange} type="email" placeholder="tucorreo@gmail.com" />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Asunto</label>
                <input style={s.input} name="asunto" value={form.asunto} onChange={handleChange} placeholder="¿En qué podemos ayudarte?" />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Mensaje</label>
                <textarea style={s.textarea} name="mensaje" value={form.mensaje} onChange={handleChange} rows={5} placeholder="Escribe tu mensaje aquí..." />
              </div>
              <button style={{ ...s.submitBtn, opacity: enviando ? 0.7 : 1 }} onClick={handleEnviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          </div>

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
  hero: { background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 60%, #0f1f2e 100%)", padding: "64px 32px" },
  heroInner: { maxWidth: "1200px", margin: "0 auto" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399", fontSize: "13px", fontWeight: "500", marginBottom: "16px", backgroundColor: "rgba(52,211,153,0.08)" },
  heroTitle: { fontSize: "42px", fontWeight: "800", color: "white", lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "12px" },
  heroSubtitle: { fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" },

  // Contenido
  content: { flex: 1, padding: "64px 32px", backgroundColor: "white" },
  contentInner: { maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" },

  infoCol: {},
  infoTitle: { fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "10px", letterSpacing: "-0.02em" },
  infoDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "32px" },
  infoCards: { display: "flex", flexDirection: "column", gap: "16px" },
  infoCard: { display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
  infoCardIcon: { fontSize: "24px", flexShrink: 0 },
  infoCardTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" },
  infoCardLine: { fontSize: "13px", color: "#64748b", lineHeight: "1.5" },

  formCol: {},
  form: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldWrap: {},
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" },
  submitBtn: { padding: "13px", backgroundColor: "#3674B5", color: "white", fontSize: "15px", fontWeight: "600", border: "none", borderRadius: "10px", cursor: "pointer" },
  successBox: { padding: "12px 16px", borderRadius: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "14px", fontWeight: "500" },
  errorBox: { padding: "12px 16px", borderRadius: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "14px" },

  // Footer
  footer: { backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 32px" },
  footerInner: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerBrand: { display: "flex", alignItems: "center", gap: "8px" },
  footerBrandName: { fontSize: "14px", fontWeight: "600", color: "white" },
  footerCopy: { fontSize: "12px", color: "rgba(255,255,255,0.3)" },
};
