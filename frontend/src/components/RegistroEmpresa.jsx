import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registroEmpresa } from "../services/api";
import { getDepartamentos, getMunicipios } from "../modules/ubicacion/services/ubicacion.api";

// ─── Componente principal ────────────────────────────────────────────────────
export default function RegistroEmpresa() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados — ubicación desde backend
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [form, setForm] = useState({
    nombre: "", nit: "", email: "", telefono: "",
    admin_nombre: "", admin_apellido: "", admin_usuario: "",
    admin_contrasena: "", admin_telefono: "", admin_direccion: "",
    admin_tipo_documento: "Cédula de ciudadanía",
    admin_numero_documento: "", admin_rol_id: 1, admin_id_municipio: "",
    _departamento: "",   // solo para la UI, no se envía al backend
  });

  // Cargar departamentos al montar (sin token, es registro público)
  useEffect(() => {
    getDepartamentos(null).then(setDepartamentos).catch(console.error);
  }, []);

  // Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (!form._departamento) { setMunicipios([]); return; }
    getMunicipios(form._departamento, null)
      .then(setMunicipios)
      .catch(console.error);
  }, [form._departamento]);

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    if (name === "_departamento") {
      setForm((prev) => ({ ...prev, _departamento: value, admin_id_municipio: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegistro = async () => {
    setLoading(true);
    try {
      const { _departamento, ...payload } = form;
      // Asegurar que id_municipio sea número o null
      payload.admin_id_municipio = payload.admin_id_municipio
        ? Number(payload.admin_id_municipio)
        : null;
      const res = await registroEmpresa(payload);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("empresa_id", res.empresa_id);
        navigate("/dashboard");
      } else {
        setError(res.error || "Error al registrar. Verifica los datos.");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const camposEmpresaLlenos = form.nombre && form.nit && form.email && form.telefono;

  return (
    <div style={s.page}>

      {/* Panel izquierdo */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="rgba(255,255,255,0.15)"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={s.logoText}>FishWare</span>
          </div>

          <div>
            <h2 style={s.leftTitle}>Empieza en minutos</h2>
            <p style={s.leftSubtitle}>
              Registra tu empresa y comienza a gestionar productos, ventas y usuarios desde un solo lugar.
            </p>
          </div>

          <div style={s.stepsIndicator}>
            {[
              { n: 1, label: "Datos de la empresa" },
              { n: 2, label: "Administrador" },
            ].map((st) => (
              <div key={st.n} style={s.stepRow}>
                <div style={{
                  ...s.stepCircle,
                  backgroundColor: step >= st.n ? "white" : "rgba(255,255,255,0.15)",
                  color: step >= st.n ? "#1e3a8a" : "rgba(255,255,255,0.5)",
                }}>
                  {step > st.n ? "✓" : st.n}
                </div>
                <span style={{
                  ...s.stepLabel,
                  color: step >= st.n ? "white" : "rgba(255,255,255,0.45)",
                }}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <div style={s.leftFooter}>
            <p style={s.leftFooterText}>¿Ya tienes cuenta de empresa?</p>
            <button style={s.leftBtn} onClick={() => navigate("/empresa/login")}>
              Acceso empresa →
            </button>
            <div style={s.clienteBox}>
              <span style={s.clienteBoxText}>¿Eres cliente?</span>
              <button style={s.clienteBoxLink} onClick={() => navigate("/tienda")}>
                Ir a la tienda →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={s.right}>
        <div style={s.formWrap}>

          <div style={s.formHeader}>
            <div style={s.stepTag}>Paso {step} de 2</div>
            <h2 style={s.formTitle}>
              {step === 1 ? "Datos de la empresa" : "Datos del administrador"}
            </h2>
            <p style={s.formSubtitle}>
              {step === 1
                ? "Información básica de tu organización"
                : "Quien gestionará la plataforma"}
            </p>
          </div>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          {/* PASO 1 */}
          {step === 1 && (
            <div style={s.fieldsGrid}>
              <Field label="Nombre de la empresa" icon="🏢">
                <input style={s.input} name="nombre" placeholder="Ej: Comercializadora XYZ" value={form.nombre} onChange={handleChange}/>
              </Field>
              <Field label="NIT" icon="📄">
                <input style={s.input} name="nit" placeholder="900.123.456-7" value={form.nit} onChange={handleChange}/>
              </Field>
              <Field label="Correo electrónico" icon="✉️" full>
                <input style={s.input} name="email" type="email" placeholder="contacto@empresa.com" value={form.email} onChange={handleChange}/>
              </Field>
              <Field label="Teléfono" icon="📞">
                <input style={s.input} name="telefono" placeholder="+57 300 000 0000" value={form.telefono} onChange={handleChange}/>
              </Field>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div style={s.fieldsGrid}>
              <Field label="Nombre" icon="👤">
                <input style={s.input} name="admin_nombre" placeholder="Juan" value={form.admin_nombre} onChange={handleChange}/>
              </Field>
              <Field label="Apellido" icon="👤">
                <input style={s.input} name="admin_apellido" placeholder="García" value={form.admin_apellido} onChange={handleChange}/>
              </Field>
              <Field label="Usuario (email)" icon="✉️" full>
                <input style={s.input} name="admin_usuario" type="email" placeholder="admin@empresa.com" value={form.admin_usuario} onChange={handleChange}/>
              </Field>
              <Field label="Contraseña" icon="🔒" full>
                <input style={s.input} name="admin_contrasena" type="password" placeholder="••••••••" value={form.admin_contrasena} onChange={handleChange}/>
              </Field>
              <Field label="Teléfono" icon="📞">
                <input style={s.input} name="admin_telefono" placeholder="+57 300 000 0000" value={form.admin_telefono} onChange={handleChange}/>
              </Field>
              <Field label="Dirección" icon="📍">
                <input style={s.input} name="admin_direccion" placeholder="Calle 123 #45-67" value={form.admin_direccion} onChange={handleChange}/>
              </Field>
              <Field label="Tipo de documento" icon="🪪" full>
                <select style={s.input} name="admin_tipo_documento" value={form.admin_tipo_documento} onChange={handleChange}>
                  <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                  <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                  <option value="Cédula de extranjería">Cédula de extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </Field>
              <Field label="Número de documento" icon="🔢">
                <input style={s.input} name="admin_numero_documento" placeholder="1234567890" value={form.admin_numero_documento} onChange={handleChange}/>
              </Field>

              {/* ── Departamento (desde backend) ── */}
              <Field label="Departamento" icon="🗺️">
                <select
                  style={s.input}
                  name="_departamento"
                  value={form._departamento}
                  onChange={handleChange}
                >
                  <option value="">-- Selecciona --</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </Field>

              {/* ── Municipio (desde backend, depende del departamento) ── */}
              <Field label="Municipio" icon="🏙️">
                <select
                  style={{
                    ...s.input,
                    color: form._departamento ? "#0f172a" : "#94a3b8",
                  }}
                  name="admin_id_municipio"
                  value={form.admin_id_municipio}
                  onChange={handleChange}
                  disabled={!form._departamento}
                >
                  <option value="">
                    {form._departamento ? "-- Selecciona --" : "Primero elige departamento"}
                  </option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* Botones */}
          <div style={s.btnRow}>
            {step === 2 && (
              <button style={s.btnBack} onClick={() => setStep(1)}>
                ← Atrás
              </button>
            )}
            {step === 1 ? (
              <button
                style={{ ...s.btnNext, opacity: camposEmpresaLlenos ? 1 : 0.5 }}
                disabled={!camposEmpresaLlenos}
                onClick={() => setStep(2)}
              >
                Continuar →
              </button>
            ) : (
              <button
                style={{ ...s.btnNext, opacity: loading ? 0.75 : 1 }}
                disabled={loading}
                onClick={handleRegistro}
              >
                {loading ? "Registrando..." : "Crear empresa"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Componente auxiliar
function Field({ label, icon, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "span 1" }}>
      <label style={s.label}>
        <span>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  left: {
    flex: "0 0 380px",
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 55%, #0f1f2e 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
  },
  leftContent: { display: "flex", flexDirection: "column", gap: "40px", width: "100%" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoText: { fontSize: "20px", fontWeight: "700", color: "white" },
  leftTitle: { fontSize: "28px", fontWeight: "800", color: "white", letterSpacing: "-0.02em", marginBottom: "12px" },
  leftSubtitle: { fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7" },
  stepsIndicator: { display: "flex", flexDirection: "column", gap: "16px" },
  stepRow: { display: "flex", alignItems: "center", gap: "12px" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0, transition: "all 0.2s" },
  stepLabel: { fontSize: "14px", fontWeight: "500", transition: "color 0.2s" },
  leftFooter: {},
  leftFooterText: { fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" },
  leftBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
  clienteBox: { marginTop: "12px", padding: "10px 14px", backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  clienteBoxText: { fontSize: "12px", color: "rgba(255,255,255,0.6)" },
  clienteBoxLink: { background: "none", border: "none", color: "#34d399", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  right: { flex: 1, backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", overflowY: "auto" },
  formWrap: { width: "100%", maxWidth: "520px" },
  formHeader: { marginBottom: "28px" },
  stepTag: { display: "inline-block", fontSize: "11px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" },
  formTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "6px" },
  formSubtitle: { fontSize: "14px", color: "#64748b" },
  errorBox: { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "16px" },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" },
  label: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box" },
  btnRow: { display: "flex", gap: "10px" },
  btnBack: { padding: "12px 20px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#64748b", cursor: "pointer", fontWeight: "500" },
  btnNext: { flex: 1, padding: "13px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" },
};
