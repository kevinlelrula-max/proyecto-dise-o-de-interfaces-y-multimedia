import { useState, useEffect } from "react";

export default function FormCliente({ onGuardar, clienteSeleccionado }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    contrasena: "",
    telefono: "",
    direccion: "",
    numero_documento: "",
    id_municipio: 11001
  });

  // 🔥 LLENAR FORM AL EDITAR
  useEffect(() => {
    if (clienteSeleccionado) {
      setForm({
        nombre: clienteSeleccionado.nombre || "",
        apellido: clienteSeleccionado.apellido || "",
        usuario: clienteSeleccionado.usuario || "",
        contrasena: "", // no mostrar contraseña
        telefono: clienteSeleccionado.telefono || "",
        direccion: clienteSeleccionado.direccion || "",
        numero_documento: clienteSeleccionado.numero_documento || "",
        id_municipio: clienteSeleccionado.id_municipio || 11001
      });
    } else {
      // 🔄 LIMPIAR FORM CUANDO ES NUEVO
      setForm({
        nombre: "",
        apellido: "",
        usuario: "",
        contrasena: "",
        telefono: "",
        direccion: "",
        numero_documento: "",
        id_municipio: 11001
      });
    }
  }, [clienteSeleccionado]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6">
      
      <h3 className="font-bold mb-3">
        {clienteSeleccionado ? "✏️ Editar Cliente" : "➕ Nuevo Cliente"}
      </h3>

      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        className="input"
      />

      <input
        name="apellido"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
        className="input"
      />

      <input
        name="usuario"
        placeholder="Email"
        value={form.usuario}
        onChange={handleChange}
        className="input"
      />

      {!clienteSeleccionado && (
        <input
          name="contrasena"
          type="password"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          className="input"
        />
      )}

      <input
        name="telefono"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={handleChange}
        className="input"
      />

      <input
        name="direccion"
        placeholder="Dirección"
        value={form.direccion}
        onChange={handleChange}
        className="input"
      />

      <input
        name="numero_documento"
        placeholder="Documento"
        value={form.numero_documento}
        onChange={handleChange}
        className="input"
      />

      <button className="bg-green-500 text-white px-4 py-2 rounded mt-3 hover:bg-green-600 transition">
        Guardar
      </button>
    </form>
  );
}