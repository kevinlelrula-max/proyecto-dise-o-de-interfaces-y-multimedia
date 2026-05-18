import { useState } from "react";

export default function CambiarPassword({ onGuardar, error, exito }) {
  const [form, setForm] = useState({
    contrasena_actual: "",
    contrasena_nueva:  "",
    confirmar:         "",
  });
  const [localError, setLocalError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (form.contrasena_nueva.length < 6) {
      return setLocalError("La contraseña nueva debe tener al menos 6 caracteres.");
    }
    if (form.contrasena_nueva !== form.confirmar) {
      return setLocalError("Las contraseñas nuevas no coinciden.");
    }

    onGuardar({
      contrasena_actual: form.contrasena_actual,
      contrasena_nueva:  form.contrasena_nueva,
    });

    // Limpiar campos tras enviar
    setForm({ contrasena_actual: "", contrasena_nueva: "", confirmar: "" });
  };

  const mensajeError = localError || error;

  return (
    <section style={s.card}>
      <h2 style={s.titulo}>Cambiar contraseña</h2>

      <form onSubmit={handleSubmit} style={s.form}>
        <Campo
          label="Contraseña actual"
          value={form.contrasena_actual}
          onChange={set("contrasena_actual")}
        />
        <Campo
          label="Nueva contraseña"
          value={form.contrasena_nueva}
          onChange={set("contrasena_nueva")}
        />
        <Campo
          label="Confirmar nueva contraseña"
          value={form.confirmar}
          onChange={set("confirmar")}
        />

        {mensajeError && <p style={s.msgError}>{mensajeError}</p>}
        {exito        && <p style={s.msgExito}>{exito}</p>}

        <button type="submit" style={s.btn}>Cambiar contraseña</button>
      </form>
    </section>
  );
}

function Campo({ label, value, onChange }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type="password"
        value={value}
        onChange={onChange}
        required
        autoComplete="new-password"
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
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  msgError: { fontSize: 13, color: "#ef4444", margin: 0, fontWeight: 500 },
  msgExito: { fontSize: 13, color: "#3674B5", margin: 0, fontWeight: 500 },
};
