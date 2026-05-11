import { useState, useEffect } from "react";

export default function DatosPersonales({ perfil, onGuardar, error, exito }) {
  const [form, setForm] = useState({
    nombre:    "",
    apellido:  "",
    telefono:  "",
    direccion: "",
  });

  // Prellenar cuando llega el perfil
  useEffect(() => {
    if (perfil) {
      setForm({
        nombre:    perfil.nombre    || "",
        apellido:  perfil.apellido  || "",
        telefono:  perfil.telefono  || "",
        direccion: perfil.direccion || "",
      });
    }
  }, [perfil]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onGuardar(form);
  };

  return (
    <section style={s.card}>
      <h2 style={s.titulo}>Datos personales</h2>

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.row2}>
          <Campo label="Nombre *" value={form.nombre} onChange={set("nombre")} required />
          <Campo label="Apellido" value={form.apellido} onChange={set("apellido")} />
        </div>
        <Campo label="Teléfono" value={form.telefono} onChange={set("telefono")} type="tel" />
        <Campo label="Dirección" value={form.direccion} onChange={set("direccion")} />

        {error  && <p style={s.msgError}>{error}</p>}
        {exito  && <p style={s.msgExito}>{exito}</p>}

        <button type="submit" style={s.btn}>Guardar cambios</button>
      </form>
    </section>
  );
}

function Campo({ label, value, onChange, type = "text", required = false }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

const s = {
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "28px 28px 24px",
  },
  titulo: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1e8e0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#f8faf9",
  },
  btn: {
    marginTop: 4,
    padding: "12px",
    background: "#0F6E56",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  msgError: { fontSize: 13, color: "#ef4444", margin: 0, fontWeight: 500 },
  msgExito: { fontSize: 13, color: "#0F6E56", margin: 0, fontWeight: 500 },
};
