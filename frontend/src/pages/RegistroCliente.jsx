import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registroCliente } from "../services/api";
import { getDepartamentos, getMunicipios } from "../modules/ubicacion/services/ubicacion.api";
import logoWarefish from "../assets/logowarefish.png";

export default function RegistroCliente() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios]       = useState([]);

  const [form, setForm] = useState({
    nombre:           "",
    apellido:         "",
    usuario:          "",
    contrasena:       "",
    confirmar:        "",
    telefono:         "",
    direccion:        "",
    tipo_documento:   "Cédula de ciudadanía",
    numero_documento: "",
    _departamento:    "",
    id_municipio:     "",
    rol_id:           4,
    empresa_id:       null,
  });

  useEffect(() => {
    getDepartamentos(null).then(setDepartamentos).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form._departamento) { setMunicipios([]); return; }
    getMunicipios(form._departamento, null).then(setMunicipios).catch(console.error);
  }, [form._departamento]);

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    if (name === "_departamento") {
      setForm((prev) => ({ ...prev, _departamento: value, id_municipio: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const paso1Error = () => {
    if (!form.nombre || !form.apellido) return "Ingresa tu nombre completo.";
    if (!form.usuario) return "Ingresa tu correo electrónico.";
    if (!form.contrasena) return "Ingresa una contraseña.";
    if (form.contrasena !== form.confirmar) return "Las contraseñas no coinciden.";
    if (!form.telefono) return "Ingresa tu número de teléfono.";
    return "";
  };

  const handleSiguiente = () => {
    const err = paso1Error();
    if (err) { setError(err); return; }
    setStep(2);
  };

  const handleRegistro = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // ✅ FIX 1: excluir campos que no van al backend
      const { _departamento, confirmar, ...payload } = form;

      // ✅ FIX 2: id_municipio vacío → null (evita error INTEGER en postgres)
      payload.id_municipio = payload.id_municipio
        ? Number(payload.id_municipio)
        : null;

      const res = await registroCliente(payload);

      // ✅ FIX 3: el backend retorna { cliente_id, nombre } — verificar correctamente
      if (res?.cliente_id || res?.id) {
        navigate("/tienda/login");
        return;
      }

      setError(res?.error || "Error al registrar. Verifica los datos.");

    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── Panel izquierdo ── */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <img src={logoWarefish} alt="WareFish Logo" style={{ width: 64, height: 64, objectFit: "contain" }} />
            <span style={s.logoText}>WareFish · Tienda</span>
          </div>

          <div>
            <h2 style={s.leftTitle}>Crea tu cuenta y empieza a comprar</h2>
            <p style={s.leftSubtitle}>
              Regístrate gratis y accede al catálogo de las mejores pesqueras de la región.
            </p>
          </div>

          <div style={s.stepsIndicator}>
            {[{ n: 1, label: "Tu cuenta" }, { n: 2, label: "Tu ubicación" }].map((st) => (
              <div key={st.n} style={s.stepRow}>
                <div style={{
                  ...s.stepCircle,
                  backgroundColor: step >= st.n ? "white" : "rgba(255,255,255,0.15)",
                  color: step >= st.n ? "#3674B5" : "rgba(255,255,255,0.4)",
                }}>
                  {step > st.n ? "✓" : st.n}
                </div>
                <span style={{ ...s.stepLabel, color: step >= st.n ? "white" : "rgba(255,255,255,0.4)" }}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <div style={s.leftFooter}>
            <p style={s.leftFooterText}>¿Ya tienes cuenta?</p>
            <button style={s.leftBtn} onClick={() => navigate("/tienda/login")}>
              Iniciar sesión →
            </button>
          </div>
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={s.right}>
        <div style={s.formWrap}>
          <div style={s.formHeader}>
            <div style={s.stepTag}>Paso {step} de 2</div>
            <h2 style={s.formTitle}>
              {step === 1 ? "Datos de tu cuenta" : "¿Dónde te enviamos?"}
            </h2>
            <p style={s.formSubtitle}>
              {step === 1 ? "Información básica para crear tu perfil" : "Tu dirección de entrega predeterminada"}
            </p>
          </div>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          {/* PASO 1 */}
          {step === 1 && (
            <div style={s.fieldsGrid}>
              <Field label="Nombre" icon="👤">
                <input style={s.input} name="nombre" placeholder="Juan" value={form.nombre} onChange={handleChange}/>
              </Field>
              <Field label="Apellido" icon="👤">
                <input style={s.input} name="apellido" placeholder="García" value={form.apellido} onChange={handleChange}/>
              </Field>
              <Field label="Correo electrónico" icon="✉️" full>
                <input style={s.input} name="usuario" type="email" placeholder="tucorreo@gmail.com" value={form.usuario} onChange={handleChange}/>
              </Field>
              <Field label="Teléfono" icon="📞" full>
                <input style={s.input} name="telefono" placeholder="+57 300 000 0000" value={form.telefono} onChange={handleChange}/>
              </Field>
              <Field label="Contraseña" icon="🔒" full>
                <div style={s.inputWrap}>
                  <input
                    style={{ ...s.input, paddingLeft: "12px" }}
                    name="contrasena"
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.contrasena}
                    onChange={handleChange}
                  />
                  <button style={s.eyeBtn} onClick={() => setShowPass(!showPass)} type="button" tabIndex={-1}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </Field>
              <Field label="Confirmar contraseña" icon="🔒" full>
                <input
                  style={{ ...s.input, borderColor: form.confirmar && form.contrasena !== form.confirmar ? "#fca5a5" : "#e2e8f0" }}
                  name="confirmar"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmar}
                  onChange={handleChange}
                />
                {form.confirmar && form.contrasena !== form.confirmar && (
                  <span style={s.fieldError}>Las contraseñas no coinciden</span>
                )}
              </Field>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div style={s.fieldsGrid}>
              <Field label="Tipo de documento" icon="🪪" full>
                <select style={s.input} name="tipo_documento" value={form.tipo_documento} onChange={handleChange}>
                  <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                  <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                  <option value="Cédula de extranjería">Cédula de extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </Field>
              <Field label="Número de documento" icon="🔢" full>
                <input style={s.input} name="numero_documento" placeholder="1234567890" value={form.numero_documento} onChange={handleChange}/>
              </Field>
              <Field label="Departamento" icon="🗺️">
                <select style={s.input} name="_departamento" value={form._departamento} onChange={handleChange}>
                  <option value="">-- Selecciona --</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Municipio" icon="🏙️">
                <select
                  style={{ ...s.input, color: form._departamento ? "#0f172a" : "#94a3b8" }}
                  name="id_municipio"
                  value={form.id_municipio}
                  onChange={handleChange}
                  disabled={!form._departamento}
                >
                  <option value="">{form._departamento ? "-- Selecciona --" : "Primero elige departamento"}</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Dirección de entrega" icon="📍" full>
                <input style={s.input} name="direccion" placeholder="Calle 123 #45-67, Apto 201" value={form.direccion} onChange={handleChange}/>
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={s.hint}>
                  💡 Estos datos son opcionales pero nos ayudan a calcular el costo de envío. Podrás actualizarlos luego desde tu perfil.
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div style={s.btnRow}>
            {step === 2 && (
              <button style={s.btnBack} onClick={() => { setError(""); setStep(1); }}>
                ← Atrás
              </button>
            )}
            {step === 1 ? (
              <button style={s.btnNext} onClick={handleSiguiente}>
                Continuar →
              </button>
            ) : (
              <button
                style={{ ...s.btnNext, opacity: loading ? 0.75 : 1 }}
                disabled={loading}
                onClick={handleRegistro}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </button>
            )}
          </div>

          {step === 2 && (
            <p style={s.skipText}>
              <button style={s.skipBtn} onClick={handleRegistro} disabled={loading}>
                Omitir por ahora y entrar a la tienda
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "span 1" }}>
      <label style={s.label}><span>{icon}</span> {label}</label>
      {children}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  left: { flex: "0 0 360px", background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 55%, #0f1f2e 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" },
  leftContent: { display: "flex", flexDirection: "column", gap: "36px", width: "100%" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoText: { fontSize: "18px", fontWeight: "700", color: "white" },
  leftTitle: { fontSize: "26px", fontWeight: "800", color: "white", letterSpacing: "-0.02em", marginBottom: "12px", lineHeight: "1.25" },
  leftSubtitle: { fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7" },
  stepsIndicator: { display: "flex", flexDirection: "column", gap: "16px" },
  stepRow: { display: "flex", alignItems: "center", gap: "12px" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0, transition: "all 0.2s" },
  stepLabel: { fontSize: "14px", fontWeight: "500", transition: "color 0.2s" },
  leftFooter: { borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "24px" },
  leftFooterText: { fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" },
  leftBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "500" },
  right: { flex: 1, backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", overflowY: "auto" },
  formWrap: { width: "100%", maxWidth: "520px" },
  formHeader: { marginBottom: "28px" },
  stepTag: { display: "inline-block", fontSize: "11px", fontWeight: "700", color: "#3674B5", backgroundColor: "#EEF4FF", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" },
  formTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "6px" },
  formSubtitle: { fontSize: "14px", color: "#64748b" },
  errorBox: { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" },
  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" },
  label: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "0", lineHeight: 1 },
  fieldError: { fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" },
  hint: { fontSize: "12px", color: "#94a3b8", backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: "8px", lineHeight: "1.6" },
  btnRow: { display: "flex", gap: "10px" },
  btnBack: { padding: "12px 20px", background: "transparent", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#64748b", cursor: "pointer", fontWeight: "500" },
  btnNext: { flex: 1, padding: "13px", backgroundColor: "#3674B5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" },
  skipText: { textAlign: "center", marginTop: "14px" },
  skipBtn: { background: "none", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", textDecoration: "underline" },
};