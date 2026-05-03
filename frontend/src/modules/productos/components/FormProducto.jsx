import { useState, useEffect } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;

export default function FormProducto({ producto, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria_id: 1,
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    if (producto) {
      setForm(producto);
      if (producto.imagen_url) {
        setImagenPreview(`${API_BASE}${producto.imagen_url}`);
      }
    }
  }, [producto]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file)); // preview local
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre",      form.nombre);
    formData.append("precio",      form.precio);
    formData.append("stock",       form.stock);
    formData.append("categoria_id",form.categoria_id);
    if (imagenFile) {
      formData.append("imagen", imagenFile);
    }

    onSave(formData, producto?.id);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{producto ? "Editar Producto" : "Nuevo Producto "}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="precio"
            placeholder="Precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="stock"
            placeholder="Stock (kg)"
            type="number"
            value={form.stock}
            onChange={handleChange}
            style={styles.input}
          />

          {/* ✅ Campo de imagen */}
          <div style={styles.imagenWrap}>
            <label style={styles.imagenLabel}>
              {imagenPreview ? (
                <img src={imagenPreview} alt="preview" style={styles.preview} />
              ) : (
                <div style={styles.imagenPlaceholder}>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <span style={{ fontSize: 12, color: "#aaa" }}>
                    Subir imagen del producto
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagen}
                style={{ display: "none" }}
              />
            </label>
            {imagenPreview && (
              <button
                type="button"
                onClick={() => { setImagenFile(null); setImagenPreview(null); }}
                style={styles.quitarImg}
              >
                Quitar imagen
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" style={styles.btnGuardar}>
              Guardar
            </button>
            <button type="button" onClick={onClose} style={styles.btnCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 50,
  },
  modal: {
    background: "white", padding: "24px",
    borderRadius: "14px", width: "320px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  input: {
    width: "100%", padding: "8px 12px",
    border: "1.5px solid #eee", borderRadius: 8,
    fontSize: 14, marginBottom: 8,
    boxSizing: "border-box",
  },
  imagenWrap: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
  },
  imagenLabel: {
    cursor: "pointer", width: "100%",
  },
  preview: {
    width: "100%", height: 160,
    objectFit: "cover", borderRadius: 10,
    border: "1.5px solid #eee",
  },
  imagenPlaceholder: {
    width: "100%", height: 120,
    border: "1.5px dashed #ddd", borderRadius: 10,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 6,
    cursor: "pointer", background: "#fafafa",
  },
  quitarImg: {
    background: "none", border: "none",
    color: "#FF4D4D", fontSize: 12, cursor: "pointer",
  },
  btnGuardar: {
    flex: 1, padding: "9px",
    background: "#00C9A7", color: "#fff",
    border: "none", borderRadius: 8,
    fontSize: 14, cursor: "pointer",
  },
  btnCancelar: {
    flex: 1, padding: "9px",
    background: "#f5f5f5", color: "#555",
    border: "none", borderRadius: 8,
    fontSize: 14, cursor: "pointer",
  },
};