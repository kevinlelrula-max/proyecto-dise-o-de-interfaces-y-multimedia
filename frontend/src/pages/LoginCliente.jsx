import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginCliente } from "../services/api"; // ajusta la ruta según tu proyecto

export default function LoginCliente() {
  const navigate = useNavigate();
  const location = useLocation();

  // Si el cliente intentó entrar a una tienda específica, lo devolvemos ahí después del login
  const from = location.state?.from || "/tienda";

  const [form, setForm]       = useState({ usuario: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.usuario || !form.contrasena) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await loginCliente(form);
      if (res.token) {
        localStorage.setItem("cliente_token", res.token);
        localStorage.setItem("cliente_id", res.id);   // ✅ AQUÍ ESTÁ EL FIX
        localStorage.setItem("cliente_nombre", res.usuario);
        navigate(from, { replace: true });
      } else {
        setError(res.error || "Correo o contraseña incorrectos.");
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={s.page}>

      {/* ── Panel izquierdo — branding tienda ── */}
      <div style={s.left}>
        <div style={s.leftContent}>

          {/* Logo */}
          <div style={s.leftLogo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={s.leftLogoText}>WareFish · Tienda</span>
          </div>

          {/* Hero */}
          <div style={s.leftHero}>
            <h2 style={s.leftTitle}>Compra pescado fresco desde donde estés</h2>
            <p style={s.leftSubtitle}>
              Accede a las mejores pesqueras de la región, arma tu pedido y recíbelo en casa.
            </p>
          </div>

          {/* Pills */}
          <div style={s.pillsWrap}>
            {["🐟 Producto fresco", "🚚 Envío a domicilio", "🏪 Múltiples tiendas", "📦 Seguimiento de pedido"].map((tag) => (
              <span key={tag} style={s.pill}>{tag}</span>
            ))}
          </div>

          {/* Footer izquierdo */}
          <div style={s.leftFooter}>
            <p style={s.leftFooterText}>¿Eres una empresa?</p>
            <button style={s.leftBtn} onClick={() => navigate("/empresa/login")}>
              Acceder como empresa →
            </button>
          </div>

        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={s.right}>
        <div style={s.formCard}>

          <div style={s.formHeader}>
            <div style={s.formLogoSmall}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="#0F6E56"/>
                <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="15" r="1.5" fill="white"/>
              </svg>
            </div>
            <h2 style={s.formTitle}>Bienvenido de nuevo</h2>
            <p style={s.formSubtitle}>Inicia sesión para ver tus pedidos y comprar</p>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Email */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Correo electrónico</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="2" y="4" width="16" height="13" rx="2"/>
                  <path d="M2 7l8 5 8-5"/>
                </svg>
              </span>
              <input
                style={s.input}
                name="usuario"
                type="email"
                placeholder="tucorreo@gmail.com"
                value={form.usuario}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Contraseña</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="3" y="8" width="14" height="10" rx="2"/>
                  <path d="M7 8V6a3 3 0 0 1 6 0v2"/>
                  <circle cx="10" cy="13" r="1.2" fill="#94a3b8" stroke="none"/>
                </svg>
              </span>
              <input
                style={s.input}
                name="contrasena"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.contrasena}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button style={s.eyeBtn} onClick={() => setShowPass(!showPass)} type="button" tabIndex={-1}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            style={{ ...s.btnLogin, opacity: loading ? 0.75 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Ingresar a la tienda"}
          </button>

          {/* Divider */}
          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>¿No tienes cuenta?</span>
            <span style={s.dividerLine} />
          </div>

          <button
            style={s.btnRegister}
            onClick={() => navigate("/tienda/registro")}
          >
            Crear cuenta gratis
          </button>

        </div>
      </div>
    </div>
  );
}

/* ─── ESTILOS ─── */
const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Izquierdo
  left: {
    flex: "1 1 55%",
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 55%, #0f1f2e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
  },
  leftContent: {
    maxWidth: "440px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
    position: "relative",
    zIndex: 1,
  },
  leftLogo: { display: "flex", alignItems: "center", gap: "12px" },
  leftLogoText: { fontSize: "20px", fontWeight: "700", color: "white", letterSpacing: "-0.02em" },
  leftHero: {},
  leftTitle: { fontSize: "30px", fontWeight: "700", color: "white", lineHeight: "1.2", marginBottom: "14px", letterSpacing: "-0.02em" },
  leftSubtitle: { fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: "1.6" },
  pillsWrap: { display: "flex", flexWrap: "wrap", gap: "8px" },
  pill: { padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: "500", backgroundColor: "rgba(255,255,255,0.08)" },
  leftFooter: { borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "24px" },
  leftFooterText: { fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" },
  leftBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "500" },

  // Derecho
  right: {
    flex: "1 1 45%",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  formCard: { width: "100%", maxWidth: "380px" },
  formHeader: { marginBottom: "28px" },
  formLogoSmall: { marginBottom: "20px" },
  formTitle: { fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.02em" },
  formSubtitle: { fontSize: "14px", color: "#64748b" },

  errorBox: { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" },

  fieldWrap: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px", display: "flex", alignItems: "center", pointerEvents: "none" },
  input: { width: "100%", padding: "11px 40px 11px 38px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "0", lineHeight: 1 },

  btnLogin: { width: "100%", padding: "13px", backgroundColor: "#0F6E56", color: "white", fontSize: "15px", fontWeight: "600", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "8px", marginBottom: "20px", letterSpacing: "0.01em", transition: "background 0.2s" },

  divider: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" },

  btnRegister: { width: "100%", padding: "12px", backgroundColor: "transparent", color: "#0F6E56", fontSize: "14px", fontWeight: "600", border: "1.5px solid #0F6E56", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" },
};
