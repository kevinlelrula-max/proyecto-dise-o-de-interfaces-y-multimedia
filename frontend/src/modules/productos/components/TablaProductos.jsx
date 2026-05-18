import { formatearPrecio } from "../helpers/formatearPrecio";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;
const IMG_PLACEHOLDER = "https://placehold.co/300x200/EEF4FF/3674B5?text=🐟";

// ── Stock helpers ─────────────────────────────────────────────────────────────
function getStockMeta(stock) {
  if (stock === 0)   return { barColor: "#ef4444", textColor: "#dc2626", bg: "#fef2f2", label: "Sin stock" };
  if (stock <= 5)    return { barColor: "#ef4444", textColor: "#dc2626", bg: "#fef2f2", label: "Crítico" };
  if (stock <= 20)   return { barColor: "#f59e0b", textColor: "#b45309", bg: "#fef3c7", label: "Bajo" };
  if (stock <= 100)  return { barColor: "#3674B5", textColor: "#3674B5", bg: "#EEF4FF", label: "Normal" };
  return               { barColor: "#22c55e", textColor: "#166534", bg: "#dcfce7", label: "Alto" };
}

// ── Barra de stock ────────────────────────────────────────────────────────────
function StockBar({ stock }) {
  const pct = stock === 0 ? 0 : Math.min(stock, 200) / 200 * 100;
  const { barColor, textColor, label } = getStockMeta(stock);
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Stock
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{
            fontSize: "10px", fontWeight: "700", padding: "1px 7px",
            borderRadius: "999px", color: textColor,
            backgroundColor: getStockMeta(stock).bg,
          }}>
            {label}
          </span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: textColor }}>
            {stock} kg
          </span>
        </div>
      </div>
      <div style={{ height: "5px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: barColor,
          borderRadius: "999px",
          animation: "barGrow 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TablaProductos({ productos, onEliminar, onEditar, vista = "grid" }) {
  if (productos.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>📦</span>
        <p style={styles.emptyText}>No se encontraron productos</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes barGrow {
          from { width: 0; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .prod-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .prod-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(54,116,181,0.15) !important;
        }
        .prod-card:hover .prod-img {
          transform: scale(1.06);
        }
        .prod-img {
          transition: transform 0.3s ease;
        }
        .prod-row:hover {
          background: #f8fafc !important;
        }
      `}</style>

      {vista === "lista" ? (
        <div style={styles.listContainer}>
          {productos.map((p, idx) => {
            const meta = getStockMeta(p.stock);
            return (
              <div
                key={p.id}
                className="prod-row"
                style={{
                  ...styles.listRow,
                  animation: `rowIn 0.3s ease ${idx * 45}ms both`,
                }}
              >
                <div style={styles.listImgWrap}>
                  <img
                    src={p.imagen_url ? `${API_BASE}${p.imagen_url}` : IMG_PLACEHOLDER}
                    alt={p.nombre}
                    style={styles.listThumb}
                    onError={(e) => { e.target.src = IMG_PLACEHOLDER; }}
                  />
                </div>
                <span style={styles.listName}>{p.nombre}</span>

                {/* Barra de stock en lista */}
                <div style={{ flex: 1.2, minWidth: "120px" }}>
                  <StockBar stock={p.stock} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 100 }}>
                  <span style={styles.listPrice}>{formatearPrecio(p.precio)}</span>
                  {p.precio_costo > 0 && (
                    <span style={{ fontSize: 11, color: "#3674B5", fontWeight: 600 }}>
                      +{formatearPrecio(p.precio - p.precio_costo)}
                    </span>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => onEditar(p)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => onEliminar(p.id)}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.grid}>
          {productos.map((p, idx) => (
            <div
              key={p.id}
              className="prod-card"
              style={{
                ...styles.card,
                animation: `cardIn 0.4s ease ${idx * 55}ms both`,
              }}
            >
              {/* Imagen con zoom */}
              <div style={styles.imgWrap}>
                <img
                  src={p.imagen_url ? `${API_BASE}${p.imagen_url}` : IMG_PLACEHOLDER}
                  alt={p.nombre}
                  className="prod-img"
                  style={styles.cardImg}
                  onError={(e) => { e.target.src = IMG_PLACEHOLDER; }}
                />
              </div>

              <div style={styles.cardBody}>
                <p style={styles.cardName}>{p.nombre}</p>
                <p style={styles.cardPrice}>{formatearPrecio(p.precio)}</p>

                {/* Barra de stock */}
                <StockBar stock={p.stock} />

                {p.precio_costo > 0 && (
                  <div style={styles.costoRow}>
                    <span style={styles.costoLabel}>Costo: {formatearPrecio(p.precio_costo)}</span>
                    <span style={{
                      ...styles.ganancia,
                      color: p.precio >= p.precio_costo ? "#3674B5" : "#dc2626",
                    }}>
                      +{formatearPrecio(p.precio - p.precio_costo)}
                    </span>
                  </div>
                )}

                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => onEditar(p)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => onEliminar(p.id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "8px",
  },

  card: {
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    cursor: "default",
  },
  imgWrap: {
    position: "relative",
    width: "100%",
    height: "140px",
    overflow: "hidden",
    backgroundColor: "#EEF4FF",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardBody: {
    padding: "12px 14px",
  },
  cardName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardPrice: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#3674B5",
    marginBottom: "8px",
  },
  costoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "8px",
  },
  costoLabel: { fontSize: "11px", color: "#94a3b8", fontWeight: 500 },
  ganancia:   { fontSize: "11px", fontWeight: 700 },

  // Lista
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "8px",
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    transition: "background 0.15s",
  },
  listImgWrap: {
    width: "48px", height: "48px", flexShrink: 0,
    borderRadius: "10px", overflow: "hidden",
    border: "1.5px solid #e2e8f0", backgroundColor: "#EEF4FF",
  },
  listThumb: {
    width: "100%", height: "100%", objectFit: "cover", display: "block",
  },
  listName: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  listPrice: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#3674B5",
    minWidth: "80px",
    textAlign: "right",
  },

  // Acciones compartidas
  cardActions: { display: "flex", gap: "6px" },
  editBtn: {
    flex: 1, padding: "6px 0",
    border: "1.5px solid #3674B5", borderRadius: "8px",
    cursor: "pointer", backgroundColor: "transparent",
    color: "#3674B5", fontSize: "12px", fontWeight: "600",
  },
  deleteBtn: {
    flex: 1, padding: "6px 0",
    border: "1.5px solid #ef4444", borderRadius: "8px",
    cursor: "pointer", backgroundColor: "transparent",
    color: "#dc2626", fontSize: "12px", fontWeight: "600",
  },

  empty: { textAlign: "center", padding: "48px 20px", color: "#94a3b8" },
  emptyIcon: { fontSize: "40px", display: "block", marginBottom: "10px" },
  emptyText: { fontSize: "14px" },
};
