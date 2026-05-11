import { formatearPrecio } from "../helpers/formatearPrecio";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}`;
const IMG_PLACEHOLDER = "https://placehold.co/300x200/E1F5EE/0F6E56?text=🐟";

export default function TablaProductos({ productos, onEliminar, onEditar, vista = "grid" }) {
  if (productos.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}></span>
        <p style={styles.emptyText}>No se encontraron productos</p>
      </div>
    );
  }

  if (vista === "lista") {
    return (
      <div style={styles.listContainer}>
        {productos.map((p) => {
          const stockColor = getStockColor(p.stock);
          return (
            <div key={p.id} style={styles.listRow}>
              <img
                src={p.imagen_url ? `${API_BASE}${p.imagen_url}` : IMG_PLACEHOLDER}
                alt={p.nombre}
                style={styles.listThumb}
                onError={(e) => { e.target.src = IMG_PLACEHOLDER; }}
              />
              <span style={styles.listName}>{p.nombre}</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 100 }}>
                <span style={styles.listPrice}>{formatearPrecio(p.precio)}</span>
                {p.precio_costo > 0 && (
                  <span style={{ fontSize: 11, color: "#0F6E56", fontWeight: 600 }}>
                    +{formatearPrecio(p.precio - p.precio_costo)}
                  </span>
                )}
              </div>
              <span style={{ ...styles.badge, ...stockColor }}>
                Stock: {p.stock}
              </span>
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => onEditar(p)}>Editar</button>
                <button style={styles.deleteBtn} onClick={() => onEliminar(p.id)}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {productos.map((p) => {
        const stockColor = getStockColor(p.stock);
        return (
          <div key={p.id} style={styles.card}>
            <div style={styles.imgWrap}>
              <img
                src={p.imagen_url ? `${API_BASE}${p.imagen_url}` : IMG_PLACEHOLDER}
                alt={p.nombre}
                style={styles.cardImg}
                onError={(e) => { e.target.src = IMG_PLACEHOLDER; }}
              />
              <span style={{ ...styles.stockBadge, ...stockColor }}>
                Stock: {p.stock}
              </span>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardName}>{p.nombre}</p>
              <p style={styles.cardPrice}>{formatearPrecio(p.precio)}</p>
              {p.precio_costo > 0 && (
                <div style={styles.costoRow}>
                  <span style={styles.costoLabel}>Costo: {formatearPrecio(p.precio_costo)}</span>
                  <span style={{
                    ...styles.ganancia,
                    color: p.precio >= p.precio_costo ? "#0F6E56" : "#dc2626"
                  }}>
                    +{formatearPrecio(p.precio - p.precio_costo)}
                  </span>
                </div>
              )}
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => onEditar(p)}>Editar</button>
                <button style={styles.deleteBtn} onClick={() => onEliminar(p.id)}> Eliminar</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStockColor(stock) {
  if (stock > 100) return { backgroundColor: "#dcfce7", color: "#166534" };
  if (stock > 20)  return { backgroundColor: "#fef9c3", color: "#854d0e" };
  return { backgroundColor: "#fee2e2", color: "#991b1b" };
}

const styles = {
  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "8px",
  },

  // Card
  card: {
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.15s, box-shadow 0.15s",
    cursor: "default",
  },
  imgWrap: {
    position: "relative",
    width: "100%",
    height: "140px",
    overflow: "hidden",
    backgroundColor: "#E1F5EE",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  stockBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "999px",
  },
  cardBody: {
    padding: "12px 14px",
  },
  cardName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardPrice: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0F6E56",
    marginBottom: "4px",
  },
  costoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "8px",
  },
  costoLabel: { fontSize: "11px", color: "#94a3b8", fontWeight: 500 },
  ganancia: { fontSize: "11px", fontWeight: 700 },
  cardActions: {
    display: "flex",
    gap: "6px",
  },

  // Lista
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
  },
  listThumb: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    objectFit: "cover",
    flexShrink: 0,
    border: "1.5px solid #e2e8f0",
  },
  listName: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  listPrice: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0F6E56",
    minWidth: "80px",
    textAlign: "right",
  },

  // Compartidos
  badge: {
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  editBtn: {
    flex: 1,
    padding: "6px 0",
    border: "1.5px solid #1D9E75",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#0F6E56",
    fontSize: "12px",
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    padding: "6px 0",
    border: "1.5px solid #ef4444",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
  },

  // Empty
  empty: {
    textAlign: "center",
    padding: "48px 20px",
    color: "#94a3b8",
  },
  emptyIcon: { fontSize: "40px", display: "block", marginBottom: "10px" },
  emptyText: { fontSize: "14px" },
};
