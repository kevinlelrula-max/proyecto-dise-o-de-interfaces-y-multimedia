import { useState } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;

function formatPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(precio);
}

export default function ProductoCard({ producto, onAgregar }) {
  const [kilos, setKilos] = useState(1);
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);

  const sinStock = producto.stock === 0;

  const imgSrc = producto.imagen_url
    ? `${API_BASE}${producto.imagen_url}`
    : null;

  const handleAgregar = () => {
    if (sinStock) return;
    onAgregar(producto, kilos);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <>
      <style>{`
        @keyframes addedPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .prod-img-zoom {
          transition: transform 0.35s ease;
        }
        .prod-card-tienda:hover .prod-img-zoom {
          transform: scale(1.08);
        }
      `}</style>

      <div
        className="prod-card-tienda"
        style={{
          ...s.card,
          opacity: sinStock ? 0.72 : 1,
          boxShadow: hover && !sinStock
            ? "0 10px 36px rgba(54,116,181,0.16)"
            : "0 2px 8px rgba(0,0,0,0.06)",
          transform: hover && !sinStock ? "translateY(-4px)" : "none",
          cursor: sinStock ? "default" : "pointer",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* IMAGEN */}
        <div style={s.imgWrap}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={producto.nombre}
              className="prod-img-zoom"
              style={s.img}
            />
          ) : (
            <div style={s.imgPlaceholder}>🐟</div>
          )}

          {/* Badge categoría */}
          {producto.categoria && !sinStock && (
            <span style={s.catBadge}>{producto.categoria}</span>
          )}

          {/* Overlay "Sin stock" */}
          {sinStock && (
            <div style={s.sinStockOverlay}>
              <div style={s.sinStockBadge}>
                <span style={{ fontSize: "18px" }}>🚫</span>
                <span style={s.sinStockText}>Sin stock</span>
              </div>
            </div>
          )}
        </div>

        {/* INFO */}
        <div style={s.body}>
          <p style={s.nombre}>{producto.nombre}</p>
          <p style={s.precio}>
            {formatPrecio(producto.precio)}
            <span style={s.porKg}>/kg</span>
          </p>
          <p style={{
            ...s.stock,
            color: sinStock ? "#ef4444" : producto.stock <= 5 ? "#f59e0b" : "#94a3b8",
            fontWeight: sinStock || producto.stock <= 5 ? "600" : "400",
          }}>
            {sinStock ? "Sin stock disponible" : `Stock: ${producto.stock} kg`}
          </p>
        </div>

        {/* FOOTER */}
        <div style={{ ...s.footer, opacity: sinStock ? 0.45 : 1, pointerEvents: sinStock ? "none" : "auto" }}>
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
              background: sinStock ? "#94a3b8" : added ? "#2563a0" : "#3674B5",
              cursor: sinStock ? "not-allowed" : "pointer",
              animation: added ? "addedPop 0.3s ease both" : "none",
            }}
            onClick={handleAgregar}
            disabled={sinStock}
          >
            {sinStock ? "Sin stock" : added ? "✓ Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </>
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
    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
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
  imgPlaceholder: { fontSize: 48, opacity: 0.5 },

  catBadge: {
    position: "absolute", top: 10, left: 10,
    background: "rgba(54,116,181,0.85)", color: "#fff",
    fontSize: 10, fontWeight: 600, padding: "3px 8px",
    borderRadius: 6, letterSpacing: "0.04em", textTransform: "uppercase",
  },

  // Overlay sin stock
  sinStockOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  sinStockBadge: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
    background: "rgba(255,255,255,0.95)", borderRadius: "12px",
    padding: "10px 18px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  sinStockText: {
    fontSize: "13px", fontWeight: "800", color: "#ef4444",
    letterSpacing: "0.02em", textTransform: "uppercase",
  },

  body: { padding: "12px 14px 8px", flex: 1 },
  nombre: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1.3 },
  precio: { fontSize: 18, fontWeight: 800, color: "#3674B5", margin: "0 0 2px" },
  porKg:  { fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 2 },
  stock:  { fontSize: 11, margin: 0, transition: "color 0.2s" },

  footer: {
    padding: "10px 14px 14px",
    borderTop: "1px solid #f0f7f4",
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    transition: "opacity 0.2s",
  },
  kilosWrap: { display: "flex", alignItems: "center", gap: 4, flex: 1 },
  kiloBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: "1px solid #bfdbfe", background: "#EEF4FF",
    color: "#3674B5", fontWeight: 700, fontSize: 14,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  kilosInput: {
    width: 40, textAlign: "center",
    border: "1px solid #d1e8e0", borderRadius: 6,
    padding: "4px 2px", fontSize: 13, fontWeight: 600,
    color: "#0f172a", outline: "none",
  },
  kgLabel: { fontSize: 11, color: "#94a3b8" },
  btnAgregar: {
    padding: "7px 12px", border: "none", borderRadius: 8,
    color: "#fff", fontSize: 12, fontWeight: 700,
    transition: "background 0.2s", flexShrink: 0,
  },
};
