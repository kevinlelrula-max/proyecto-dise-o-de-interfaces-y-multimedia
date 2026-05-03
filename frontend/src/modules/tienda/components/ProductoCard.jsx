import { useState } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;

function formatPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function ProductoCard({ producto, onAgregar }) {
  const [kilos, setKilos]   = useState(1);
  const [hover, setHover]   = useState(false);
  const [added, setAdded]   = useState(false);

  const imgSrc = producto.imagen_url
    ? `${API_BASE}${producto.imagen_url}`
    : null;

  const handleAgregar = () => {
    onAgregar(producto, kilos);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      style={{
        ...s.card,
        boxShadow: hover
          ? "0 8px 32px rgba(15,110,86,0.13)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        transform: hover ? "translateY(-3px)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* imagen o placeholder */}
      <div style={s.imgWrap}>
        {imgSrc ? (
          <img src={imgSrc} alt={producto.nombre} style={s.img} />
        ) : (
          <div style={s.imgPlaceholder}>🐟</div>
        )}
        {/* badge categoría */}
        {producto.categoria && (
          <span style={s.catBadge}>{producto.categoria}</span>
        )}
      </div>

      {/* info */}
      <div style={s.body}>
        <p style={s.nombre}>{producto.nombre}</p>
        <p style={s.precio}>{formatPrecio(producto.precio)}<span style={s.porKg}>/kg</span></p>
        <p style={s.stock}>Stock: {producto.stock} kg</p>
      </div>

      {/* control kilos + botón */}
      <div style={s.footer}>
        <div style={s.kilosWrap}>
          <button
            style={s.kiloBtn}
            onClick={() => setKilos((k) => Math.max(0.5, Number((k - 0.5).toFixed(1))))}
          >−</button>
          <input
            style={s.kilosInput}
            type="number"
            min="0.5"
            step="0.5"
            value={kilos}
            onChange={(e) => setKilos(Math.max(0.5, Number(e.target.value)))}
          />
          <button
            style={s.kiloBtn}
            onClick={() => setKilos((k) => Number((k + 0.5).toFixed(1)))}
          >+</button>
          <span style={s.kgLabel}>kg</span>
        </div>

        <button
          style={{
            ...s.btnAgregar,
            background: added ? "#0a5540" : "#0F6E56",
          }}
          onClick={handleAgregar}
        >
          {added ? "✓ Agregado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}

const s = {
  card: {
    background: "#fff",
    border: "1px solid #e8f0ed",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.18s ease",
  },
  imgWrap: {
    position: "relative",
    height: 140,
    background: "#f0f7f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: {
    fontSize: 48,
    opacity: 0.5,
  },
  catBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "rgba(15,110,86,0.85)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  body: { padding: "12px 14px 8px", flex: 1 },
  nombre: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  precio: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0F6E56",
    margin: "0 0 2px",
  },
  porKg: { fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 2 },
  stock: { fontSize: 11, color: "#94a3b8", margin: 0 },
  footer: {
    padding: "10px 14px 14px",
    borderTop: "1px solid #f0f7f4",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  kilosWrap: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  kiloBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "1px solid #d1e8e0",
    background: "#f0f7f4",
    color: "#0F6E56",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kilosInput: {
    width: 40,
    textAlign: "center",
    border: "1px solid #d1e8e0",
    borderRadius: 6,
    padding: "4px 2px",
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    outline: "none",
  },
  kgLabel: { fontSize: 11, color: "#94a3b8" },
  btnAgregar: {
    padding: "7px 12px",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  },
};