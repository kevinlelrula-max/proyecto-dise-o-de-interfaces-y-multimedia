import { useState, useEffect } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;

export default function FormProducto({ producto, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    precio_costo: "",
    porcentaje_ganancia: "",
    stock: "",
    categoria_id: 1,
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  useEffect(() => {
    if (producto) {
      // Calcular el porcentaje de ganancia desde precio y costo si existen
      let pct = "";
      if (producto.precio > 0 && producto.precio_costo > 0) {
        pct = (((producto.precio - producto.precio_costo) / producto.precio_costo) * 100).toFixed(1);
      }
      setForm({ ...producto, porcentaje_ganancia: pct });
      if (producto.imagen_url) {
        setImagenPreview(`${API_BASE}${producto.imagen_url}`);
      }
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };

    // Recalcular precio de venta cuando cambia costo o porcentaje
    const costo = Number(name === "precio_costo" ? value : next.precio_costo);
    const pct   = Number(name === "porcentaje_ganancia" ? value : next.porcentaje_ganancia);

    if (costo > 0 && pct > 0) {
      next.precio = Math.round(costo * (1 + pct / 100)).toString();
    } else if (name === "precio_costo" || name === "porcentaje_ganancia") {
      // Si borraron alguno, limpiar precio calculado solo si no lo escribieron a mano
      if (costo <= 0 || pct <= 0) next.precio = "";
    }

    setForm(next);
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
    formData.append("nombre",       form.nombre);
    formData.append("precio",       form.precio);
    formData.append("precio_costo", form.precio_costo || "");
    formData.append("stock",        form.stock);
    formData.append("categoria_id", form.categoria_id);
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
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* Precio costo + % ganancia en la misma fila */}
          <div style={styles.row2}>
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Precio costo (COP)</label>
              <input
                name="precio_costo"
                placeholder="0"
                type="number"
                min="0"
                value={form.precio_costo}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>% Ganancia</label>
              <input
                name="porcentaje_ganancia"
                placeholder="ej: 30"
                type="number"
                min="0"
                max="999"
                value={form.porcentaje_ganancia}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Precio de venta calculado automáticamente */}
          <div style={styles.fieldWrap}>
            <label style={styles.fieldLabel}>
              Precio de venta (COP)
              {form.precio_costo && form.porcentaje_ganancia && (
                <span style={styles.autoTag}>calculado automáticamente</span>
              )}
            </label>
            <input
              name="precio"
              placeholder="Se calcula con costo + %"
              type="number"
              min="0"
              value={form.precio}
              onChange={handleChange}
              style={{
                ...styles.input,
                background: form.precio_costo && form.porcentaje_ganancia ? "#f0f7f4" : "#fff",
                fontWeight: 700,
                color: "#0F6E56",
              }}
              required
            />
          </div>

          {/* Resumen de ganancia */}
          {Number(form.precio) > 0 && Number(form.precio_costo) > 0 && (
            <div style={styles.gananciaBox}>
              <span style={styles.gananciaLabel}>Ganancia por unidad</span>
              <span style={{
                ...styles.gananciaValor,
                color: Number(form.precio) >= Number(form.precio_costo) ? "#0F6E56" : "#dc2626"
              }}>
                ${(Number(form.precio) - Number(form.precio_costo)).toLocaleString("es-CO")} COP
              </span>
            </div>
          )}

          <input
            name="stock"
            placeholder="Stock (kg)"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            style={styles.input}
            required
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
    borderRadius: "14px", width: "420px",
    display: "flex", flexDirection: "column", gap: 8,
    maxHeight: "90vh", overflowY: "auto",
  },
  input: {
    width: "100%", padding: "8px 12px",
    border: "1.5px solid #eee", borderRadius: 8,
    fontSize: 14, marginBottom: 8,
    boxSizing: "border-box",
  },
  row2: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
    marginBottom: 4,
  },
  fieldWrap: { display: "flex", flexDirection: "column" },
  fieldLabel: {
    fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.04em",
    marginBottom: 4,
  },
  gananciaBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#f0f7f4", borderRadius: 8, padding: "8px 12px",
    marginBottom: 8,
  },
  gananciaLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  gananciaValor: { fontSize: 13, fontWeight: 700 },
  autoTag: {
    marginLeft: 8, fontSize: 10, fontWeight: 600,
    color: "#0F6E56", background: "#E1F5EE",
    padding: "1px 7px", borderRadius: 999,
    verticalAlign: "middle",
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