import { useState, useEffect } from "react";
import usePerfil from "./hooks/usePerfil";

export default function Perfil() {
  const { perfil, guardarPerfil } = usePerfil();

  const [form, setForm] = useState({});
  const [passwords, setPasswords] = useState({ actual: "", nueva: "" });
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => { setForm(perfil); }, [perfil]);

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPerfil(form);
    setSavedMsg("perfil");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handlePassword = () => {
    // lógica de cambio de contraseña
    setSavedMsg("password");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const iniciales = `${form.nombre?.charAt(0) || ""}${form.apellido?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* HEADER — avatar + nombre */}
        <div style={s.profileCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>{iniciales}</div>
            <div style={s.avatarRing} />
          </div>
          <div style={s.profileInfo}>
            <h2 style={s.profileName}>
              {form.nombre} {form.apellido}
            </h2>
            <p style={s.profileUser}>{form.usuario}</p>
          </div>
          <div style={s.profileBadge}>Usuario activo</div>
        </div>

        <div style={s.grid}>

          {/* INFORMACIÓN PERSONAL */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIconWrap}>
                <span style={{ fontSize: "16px" }}></span>
              </div>
              <div>
                <h3 style={s.cardTitle}>Información personal</h3>
                <p style={s.cardSubtitle}>Actualiza tus datos de perfil</p>
              </div>
            </div>

            {savedMsg === "perfil" && (
              <div style={s.successBox}>✅ Perfil actualizado correctamente</div>
            )}

            <div style={s.fieldsGrid}>
              <div>
                <label style={s.label}>Nombre</label>
                <input
                  style={s.input}
                  value={form.nombre || ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label style={s.label}>Apellido</label>
                <input
                  style={s.input}
                  value={form.apellido || ""}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  placeholder="García"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={s.label}>Correo electrónico</label>
                <input
                  style={s.input}
                  value={form.usuario || ""}
                  onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  placeholder="admin@empresa.com"
                  type="email"
                />
              </div>
              <div>
                <label style={s.label}>Teléfono</label>
                <input
                  style={s.input}
                  value={form.telefono || ""}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="+57 300 000 0000"
                />
              </div>
              <div>
                <label style={s.label}>Número de documento</label>
                <input
                  style={{ ...s.input, ...s.inputDisabled }}
                  value={form.numero_documento || ""}
                  disabled
                  placeholder="—"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={s.label}>Dirección</label>
                <input
                  style={s.input}
                  value={form.direccion || ""}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Calle 123 #45-67"
                />
              </div>
            </div>

            <button style={s.btnPrimary} onClick={handleSubmit}>
              Guardar cambios
            </button>
          </div>

          {/* SEGURIDAD */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardIconWrap, backgroundColor: "#fef2f2" }}>
                <span style={{ fontSize: "16px" }}>🔒</span>
              </div>
              <div>
                <h3 style={s.cardTitle}>Seguridad</h3>
                <p style={s.cardSubtitle}>Cambia tu contraseña de acceso</p>
              </div>
            </div>

            {savedMsg === "password" && (
              <div style={s.successBox}>✅ Contraseña actualizada correctamente</div>
            )}

            <div style={s.secFields}>
              <div>
                <label style={s.label}>Contraseña actual</label>
                <div style={s.passWrap}>
                  <input
                    style={{ ...s.input, paddingRight: "40px" }}
                    type={showActual ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.actual}
                    onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
                  />
                  <button style={s.eyeBtn} onClick={() => setShowActual(!showActual)} type="button">
                    {showActual ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label style={s.label}>Nueva contraseña</label>
                <div style={s.passWrap}>
                  <input
                    style={{ ...s.input, paddingRight: "40px" }}
                    type={showNueva ? "text" : "password"}
                    placeholder="••••••••"
                    value={passwords.nueva}
                    onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
                  />
                  <button style={s.eyeBtn} onClick={() => setShowNueva(!showNueva)} type="button">
                    {showNueva ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Indicador de fortaleza */}
              {passwords.nueva.length > 0 && (
                <div style={s.strengthWrap}>
                  <div style={s.strengthBar}>
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        style={{
                          ...s.strengthSegment,
                          backgroundColor: getStrengthColor(passwords.nueva, n),
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    {getStrengthLabel(passwords.nueva)}
                  </span>
                </div>
              )}
            </div>

            <button style={s.btnDanger} onClick={handlePassword}>
              Actualizar contraseña
            </button>

            {/* Info de sesión */}
            <div style={s.sessionInfo}>
              <span style={s.sessionIcon}>🛡️</span>
              <span style={s.sessionText}>
                Tu sesión está protegida con token seguro
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helpers fortaleza contraseña
function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

function getStrengthColor(pwd, segment) {
  const score = getStrength(pwd);
  if (segment > score) return "#e2e8f0";
  if (score === 1) return "#ef4444";
  if (score === 2) return "#f59e0b";
  if (score === 3) return "#3b82f6";
  return "#3674B5";
}

function getStrengthLabel(pwd) {
  const score = getStrength(pwd);
  return ["", "Débil", "Regular", "Buena", "Fuerte"][score] || "";
}

const s = {
  page: {
    padding: "24px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  inner: {
    maxWidth: "860px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // Header card
  profileCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: "56px", height: "56px", borderRadius: "50%",
    backgroundColor: "#3674B5", color: "white",
    fontSize: "18px", fontWeight: "800",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarRing: {
    position: "absolute", inset: "-3px",
    borderRadius: "50%", border: "2px solid #bfdbfe",
    pointerEvents: "none",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "0 0 3px" },
  profileUser: { fontSize: "13px", color: "#64748b", margin: 0 },
  profileBadge: {
    padding: "4px 12px", borderRadius: "999px",
    backgroundColor: "#EEF4FF", color: "#3674B5",
    fontSize: "12px", fontWeight: "600",
  },

  // Grid 2 columnas
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    alignItems: "start",
  },

  // Cards
  card: {
    backgroundColor: "white", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  cardHeader: { display: "flex", alignItems: "flex-start", gap: "12px" },
  cardIconWrap: {
    width: "36px", height: "36px", borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 3px" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", margin: 0 },

  successBox: {
    backgroundColor: "#EEF4FF", border: "1px solid #bfdbfe",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#3674B5", fontWeight: "500",
  },

  // Campos
  fieldsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px",
  },
  secFields: { display: "flex", flexDirection: "column", gap: "14px" },
  label: {
    display: "block", fontSize: "12px", fontWeight: "600",
    color: "#374151", marginBottom: "6px",
  },
  input: {
    width: "100%", padding: "10px 12px",
    borderRadius: "9px", border: "1.5px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", backgroundColor: "white",
    outline: "none", boxSizing: "border-box",
  },
  inputDisabled: {
    backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed",
  },

  // Password
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: "10px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", fontSize: "14px", padding: 0,
  },

  // Fortaleza
  strengthWrap: { display: "flex", alignItems: "center", gap: "8px" },
  strengthBar: { display: "flex", gap: "4px", flex: 1 },
  strengthSegment: {
    flex: 1, height: "4px", borderRadius: "999px",
    transition: "background-color 0.2s",
  },

  // Botones
  btnPrimary: {
    width: "100%", padding: "12px",
    backgroundColor: "#3674B5", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700", cursor: "pointer",
  },
  btnDanger: {
    width: "100%", padding: "12px",
    backgroundColor: "transparent", color: "#dc2626",
    border: "1.5px solid #ef4444", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700", cursor: "pointer",
  },

  // Info sesión
  sessionInfo: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 14px", borderRadius: "10px",
    backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
  },
  sessionIcon: { fontSize: "14px" },
  sessionText: { fontSize: "12px", color: "#64748b" },
};
