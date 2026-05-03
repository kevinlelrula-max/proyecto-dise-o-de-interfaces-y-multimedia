function formatPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);
}

export default function CarritoPanel({ items, total, onCambiarKilos, onEliminar, onPedido, abierto, onCerrar }) {
  return (
    <>
      {/* overlay */}
      {abierto && (
        <div
          style={s.overlay}
          onClick={onCerrar}
        />
      )}

      {/* panel */}
      <div style={{ ...s.panel, transform: abierto ? "translateX(0)" : "translateX(100%)" }}>
        {/* header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={{ fontSize: 18 }}>🛒</span>
            <span style={s.titulo}>Mi carrito</span>
            {items.length > 0 && (
              <span style={s.badge}>{items.length}</span>
            )}
          </div>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        {/* contenido */}
        <div style={s.body}>
          {items.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: 40 }}>🐟</span>
              <p style={s.emptyText}>Tu carrito está vacío</p>
              <p style={s.emptySubText}>Agrega productos del catálogo</p>
            </div>
          ) : (
            <div style={s.lista}>
              {items.map((item) => (
                <div key={item.id} style={s.item}>
                  <div style={s.itemInfo}>
                    <p style={s.itemNombre}>{item.nombre}</p>
                    <p style={s.itemPrecio}>{formatPrecio(item.precio)}/kg</p>
                  </div>
                  <div style={s.itemControls}>
                    <div style={s.kilosRow}>
                      <button
                        style={s.kiloBtn}
                        onClick={() => onCambiarKilos(item.id, item.kilos - 0.5)}
                      >−</button>
                      <span style={s.kilosVal}>{item.kilos} kg</span>
                      <button
                        style={s.kiloBtn}
                        onClick={() => onCambiarKilos(item.id, item.kilos + 0.5)}
                      >+</button>
                    </div>
                    <div style={s.itemBottom}>
                      <span style={s.itemSubtotal}>
                        {formatPrecio(item.precio * item.kilos)}
                      </span>
                      <button
                        style={s.eliminarBtn}
                        onClick={() => onEliminar(item.id)}
                      >Quitar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer con total y botón */}
        {items.length > 0 && (
          <div style={s.footer}>
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={s.totalValor}>{formatPrecio(total)}</span>
            </div>
            <button style={s.btnPedido} onClick={onPedido}>
              Hacer pedido →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 199,
  },
  panel: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: 340,
    background: "#fff",
    boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
    zIndex: 200,
    display: "flex", flexDirection: "column",
    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
  },
  header: {
    padding: "18px 20px",
    borderBottom: "1px solid #f0f7f4",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 8 },
  titulo: { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  badge: {
    background: "#0F6E56", color: "#fff",
    fontSize: 11, fontWeight: 700,
    padding: "2px 7px", borderRadius: 99,
  },
  cerrarBtn: {
    background: "#f0f7f4", border: "none",
    borderRadius: 8, padding: "6px 10px",
    cursor: "pointer", fontSize: 14, color: "#64748b",
  },
  body: { flex: 1, overflowY: "auto", padding: "12px 16px" },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "100%", gap: 8, paddingTop: 60,
  },
  emptyText: { fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 },
  emptySubText: { fontSize: 13, color: "#94a3b8", margin: 0 },
  lista: { display: "flex", flexDirection: "column", gap: 12 },
  item: {
    background: "#f8faf9",
    borderRadius: 12, padding: "12px 14px",
    border: "1px solid #e8f0ed",
  },
  itemInfo: { marginBottom: 8 },
  itemNombre: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" },
  itemPrecio: { fontSize: 12, color: "#64748b", margin: 0 },
  itemControls: {},
  kilosRow: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 6,
  },
  kiloBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: "1px solid #d1e8e0", background: "#fff",
    color: "#0F6E56", fontWeight: 700, fontSize: 14,
    cursor: "pointer",
  },
  kilosVal: { fontSize: 13, fontWeight: 600, color: "#0f172a", minWidth: 48, textAlign: "center" },
  itemBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemSubtotal: { fontSize: 14, fontWeight: 800, color: "#0F6E56" },
  eliminarBtn: {
    background: "none", border: "none",
    color: "#ef4444", fontSize: 12,
    cursor: "pointer", fontWeight: 500,
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1px solid #f0f7f4",
  },
  totalRow: {
    display: "flex", justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 14, color: "#64748b", fontWeight: 500 },
  totalValor: { fontSize: 20, fontWeight: 800, color: "#0f172a" },
  btnPedido: {
    width: "100%",
    padding: "13px",
    background: "#0F6E56",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};