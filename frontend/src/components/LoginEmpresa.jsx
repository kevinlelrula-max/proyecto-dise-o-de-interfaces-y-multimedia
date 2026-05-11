import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmpresa } from "../services/api";

export default function LoginEmpresa() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

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
      const res = await loginEmpresa(form);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("empresa_id", res.empresa_id);
        localStorage.setItem("rol_id", res.rol_id);
        navigate("/dashboard");
      } else {
        setError(res.error || "Credenciales incorrectas.");
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

      {/* Panel izquierdo — branding */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.leftLogo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={s.leftLogoText}>FishWare</span>
          </div>

          <div style={s.leftHero}>
            <h2 style={s.leftTitle}>La plataforma que impulsa tu empresa</h2>
            <p style={s.leftSubtitle}>
              Gestión empresarial completa — productos, ventas, clientes y reportes, todo en un solo lugar.
            </p>
          </div>

          <div style={s.pillsWrap}>
            {["Multi-empresa", "Tiempo real", "Punto de venta", "Reportes", "Usuarios y roles"].map((tag) => (
              <span key={tag} style={s.pill}>{tag}</span>
            ))}
          </div>

          <div style={s.leftFooter}>
            <div style={s.statRow}>
              {[
               
              ].map((st) => (
                <div key={st.label} style={s.stat}>
                  <span style={s.statNum}>{st.n}</span>
                  <span style={s.statLabel}>{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={s.right}>
        <div style={s.formCard}>

          <div style={s.formHeader}>
            <div style={s.formLogoSmall}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="#1e3a5f"/>
                <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="15" r="1.5" fill="white"/>
              </svg>
            </div>
            <h2 style={s.formTitle}>Iniciar sesión</h2>
            <p style={s.formSubtitle}>Accede al panel de tu empresa</p>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Campo usuario */}
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
                placeholder="admin@tuempresa.com"
                value={form.usuario}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Campo contraseña */}
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
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>

          <div style={s.clienteBox}>
            <span style={s.clienteBoxText}>¿Eres cliente y quieres comprar?</span>
            <a href="/tienda" style={s.clienteBoxLink}>Ir a la tienda →</a>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Panel izquierdo
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
  leftLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  leftLogoText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "white",
    letterSpacing: "-0.02em",
  },
  leftHero: {},
  leftTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    lineHeight: "1.2",
    marginBottom: "14px",
    letterSpacing: "-0.02em",
  },
  leftSubtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.72)",
    lineHeight: "1.6",
  },
  pillsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    padding: "5px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "rgba(255,255,255,0.9)",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  leftFooter: {
    borderTop: "1px solid rgba(255,255,255,0.2)",
    paddingTop: "28px",
  },
  statRow: {
    display: "flex",
    gap: "32px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "700",
    color: "white",
  },
  statLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
  },

  // Panel derecho
  right: {
    flex: "1 1 45%",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  formCard: {
    width: "100%",
    maxWidth: "380px",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formLogoSmall: {
    marginBottom: "20px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "6px",
    letterSpacing: "-0.02em",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  fieldWrap: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 40px 11px 38px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "white",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0",
    lineHeight: 1,
  },

  btnLogin: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "20px",
    letterSpacing: "0.01em",
    transition: "background 0.2s",
  },

  registerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },
  registerLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
  clienteBox: {
    marginTop: "16px",
    padding: "12px 16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  clienteBoxText: {
    fontSize: "13px",
    color: "#166534",
  },
  clienteBoxLink: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0F6E56",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
};
