import { useState, useEffect } from "react";
import { getRoles } from "../services/usuarios.api";

export default function FormUsuario({ usuario, onGuardar, onCerrar }) {
  const token = localStorage.getItem("token");
  const [roles, setRoles] = useState([]);
  const esEdicion = !!usuario;

  const [form, setForm] = useState({
    nombre:           usuario?.nombre || "",
    apellido:         usuario?.apellido || "",
    usuario:          usuario?.usuario || "",
    contrasena:       "",
    telefono:         usuario?.telefono || "",
    direccion:        usuario?.direccion || "",
    numero_documento: usuario?.numero_documento || "",
    rol_id:           usuario?.rol_id || 3,
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getRoles(token);
        setRoles(data);
      } catch (e) {
        console.error(e);
      }
    };
    cargar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.usuario) {
      alert("Nombre y usuario son obligatorios");
      return;
    }
    if (!esEdicion && !form.contrasena) {
      alert("La contraseña es obligatoria");
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(form);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.grid}>
        <div style={s.field}>
          <label style={s.label}>Nombre *</label>
          <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Apellido</label>
          <input style={s.input} name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
        </div>

        <div style={{ ...s.field, gridColumn: "1 / -1" }}>
          <label style={s.label}>Usuario *</label>
          <input
            style={{ ...s.input, ...(esEdicion ? s.inputDisabled : {}) }}
            name="usuario" value={form.usuario} onChange={handleChange}
            placeholder="Nombre de usuario"
            disabled={esEdicion} // no cambiar usuario en edición
          />
          {esEdicion && <span style={s.hint}>El nombre de usuario no se puede cambiar</span>}
        </div>

        {!esEdicion && (
          <div style={{ ...s.field, gridColumn: "1 / -1" }}>
            <label style={s.label}>Contraseña *</label>
            <input style={s.input} type="password" name="contrasena" value={form.contrasena} onChange={handleChange} placeholder="Contraseña" />
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>Teléfono</label>
          <input style={s.input} name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Documento</label>
          <input style={s.input} name="numero_documento" value={form.numero_documento} onChange={handleChange} placeholder="N° documento" />
        </div>

        <div style={{ ...s.field, gridColumn: "1 / -1" }}>
          <label style={s.label}>Dirección</label>
          <input style={s.input} name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
        </div>

        <div style={{ ...s.field, gridColumn: "1 / -1" }}>
          <label style={s.label}>Rol *</label>
          <select style={s.input} name="rol_id" value={form.rol_id} onChange={handleChange}>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={s.footer}>
        <button type="button" style={s.btnCancelar} onClick={onCerrar}>Cancelar</button>
        <button type="submit" style={s.btnGuardar} disabled={guardando}>
          {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}

const s = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" },
  input: {
    padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "9px",
    fontSize: "13px", color: "#0f172a", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s", backgroundColor: "#fff",
  },
  inputDisabled: { backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },
  hint: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  footer: { display: "flex", gap: "10px", marginTop: "20px" },
  btnCancelar: {
    flex: 1, padding: "10px", background: "#f1f5f9", border: "none",
    borderRadius: "9px", fontSize: "13px", color: "#64748b", cursor: "pointer",
  },
  btnGuardar: {
    flex: 2, padding: "10px",
    background: "linear-gradient(135deg, #3674B5, #3674B5)",
    border: "none", borderRadius: "9px", fontSize: "13px",
    fontWeight: "600", color: "#fff", cursor: "pointer",
  },
};