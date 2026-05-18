export default function Carrito({
  carrito,
  carritoAbierto,
  setCarritoAbierto,
  cambiarKilos,
  quitarDelCarrito,
  vaciarCarrito,
  totalItems,
  totalPrecio,
  metodosPago,
  metodoPagoId,
  setMetodoPagoId,
  direccion,
  setDireccion,
  notas,
  setNotas,
  loadingPedido,
  errorPedido,
  setErrorPedido,
  confirmarPedido,
  estaLogueado,
}) {
  if (!carritoAbierto) return null;

  return (
    <>
      {/* Overlay */}
      <div style={s.overlay} onClick={() => setCarritoAbierto(false)} />

      {/* Panel */}
      <div style={s.panel}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}>🛒</span>
            <div>
              <h3 style={s.headerTitle}>Tu carrito</h3>
              <p style={s.headerSub}>
                {carrito.length === 0
                  ? "Vacío"
                  : `${carrito.length} producto${carrito.length !== 1 ? "s" : ""} · ${totalItems.toFixed(1)} kg`}
              </p>
            </div>
          </div>
          <button style={s.closeBtn} onClick={() => setCarritoAbierto(false)}>✕</button>
        </div>

        {/* Contenido */}
        <div style={s.body}>

          {carrito.length === 0 ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>🛒</span>
              <p style={s.emptyTitle}>Tu carrito está vacío</p>
              <p style={s.emptyDesc}>Agrega productos del catálogo</p>
            </div>
          ) : (
            <>
              {/* Lista de items */}
              <div style={s.items}>
                {carrito.map((item) => (
                  <div key={item.id} style={s.item}>
                    <div style={s.itemEmoji}>🐟</div>
                    <div style={s.itemInfo}>
                      <p style={s.itemNombre}>{item.nombre}</p>
                      <p style={s.itemPrecio}>
                        ${Number(item.precio).toLocaleString("es-CO")} / kg
                      </p>
                    </div>

                    {/* Selector kilos */}
                    <div style={s.itemKilos}>
                      <button
                        style={s.kilosBtn}
                        onClick={() => cambiarKilos(item.id, item.kilos - 0.5)}
                      >−</button>
                      <span style={s.kilosVal}>{item.kilos.toFixed(1)}</span>
                      <button
                        style={s.kilosBtn}
                        onClick={() => cambiarKilos(item.id, item.kilos + 0.5)}
                      >+</button>
                    </div>

                    {/* Subtotal + quitar */}
                    <div style={s.itemRight}>
                      <p style={s.itemSubtotal}>
                        ${(item.kilos * item.precio).toLocaleString("es-CO")}
                      </p>
                      <button
                        style={s.quitarBtn}
                        onClick={() => quitarDelCarrito(item.id)}
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValor}>
                  ${totalPrecio.toLocaleString("es-CO")}
                </span>
              </div>

              {/* Formulario de pedido */}
              <div style={s.form}>

                {/* Dirección */}
                <div style={s.fieldWrap}>
                  <label style={s.label}>📍 Dirección de entrega</label>
                  <input
                    style={{
                      ...s.input,
                      borderColor: errorPedido && !direccion ? "#fca5a5" : "#e2e8f0",
                    }}
                    placeholder="Calle 123 #45-67, Apto 201"
                    value={direccion}
                    onChange={(e) => { setDireccion(e.target.value); setErrorPedido(""); }}
                  />
                </div>

                {/* Método de pago */}
                <div style={s.fieldWrap}>
                  <label style={s.label}>💳 Método de pago</label>
                  <div style={s.metodosGrid}>
                    {metodosPago.map((m) => (
                      <button
                        key={m.id}
                        style={{
                          ...s.metodoBtn,
                          backgroundColor: metodoPagoId === m.id ? "#EEF4FF" : "white",
                          borderColor: metodoPagoId === m.id ? "#3674B5" : "#e2e8f0",
                          color: metodoPagoId === m.id ? "#3674B5" : "#64748b",
                          fontWeight: metodoPagoId === m.id ? "700" : "500",
                        }}
                        onClick={() => setMetodoPagoId(m.id)}
                      >
                        {getIconMetodo(m.metodo)} {capitalize(m.metodo)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div style={s.fieldWrap}>
                  <label style={s.label}>📝 Notas (opcional)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Instrucciones especiales para tu pedido..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Error */}
                {errorPedido && (
                  <div style={s.errorBox}>⚠️ {errorPedido}</div>
                )}

                {/* Botón confirmar */}
                <button
                  style={{
                    ...s.btnConfirmar,
                    opacity: loadingPedido ? 0.75 : 1,
                    cursor: loadingPedido ? "not-allowed" : "pointer",
                  }}
                  onClick={confirmarPedido}
                  disabled={loadingPedido}
                >
                  {loadingPedido
                    ? "Enviando pedido..."
                    : estaLogueado
                    ? `Confirmar pedido · $${totalPrecio.toLocaleString("es-CO")}`
                    : "Inicia sesión para pedir"}
                </button>

                {/* Vaciar carrito */}
                <button style={s.btnVaciar} onClick={vaciarCarrito}>
                  Vaciar carrito
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function getIconMetodo(metodo) {
  const m = metodo?.toLowerCase();
  if (m === "efectivo")      return "💵";
  if (m === "transferencia") return "🏦";
  if (m === "nequi")         return "📱";
  if (m === "tarjeta")       return "💳";
  return "💰";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.5)",
    zIndex: 200,
    backdropFilter: "blur(2px)",
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "420px",
    backgroundColor: "white",
    zIndex: 201,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerIcon: { fontSize: "24px" },
  headerTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  headerSub: { fontSize: "12px", color: "#64748b", margin: 0 },
  closeBtn: {
    background: "none", border: "none",
    fontSize: "16px", cursor: "pointer",
    color: "#64748b", padding: "4px 8px",
    borderRadius: "6px",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "60px 0",
  },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "15px", fontWeight: "600", color: "#64748b", margin: 0 },
  emptyDesc: { fontSize: "13px", color: "#94a3b8", margin: 0 },

  // Items
  items: { display: "flex", flexDirection: "column", gap: "12px" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  itemEmoji: { fontSize: "24px", flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemNombre: {
    fontSize: "13px", fontWeight: "600",
    color: "#0f172a", margin: 0,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  itemPrecio: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  itemKilos: {
    display: "flex", alignItems: "center", gap: "6px",
    flexShrink: 0,
  },
  kilosBtn: {
    width: "22px", height: "22px", borderRadius: "6px",
    border: "1px solid #e2e8f0", backgroundColor: "white",
    fontSize: "13px", cursor: "pointer", color: "#3674B5",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  kilosVal: { fontSize: "12px", fontWeight: "600", color: "#0f172a", minWidth: "32px", textAlign: "center" },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 },
  itemSubtotal: { fontSize: "13px", fontWeight: "700", color: "#3674B5", margin: 0 },
  quitarBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "13px", padding: 0 },

  // Total
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#EEF4FF",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
  },
  totalLabel: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  totalValor: { fontSize: "20px", fontWeight: "800", color: "#3674B5" },

  // Formulario
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  fieldWrap: {},
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 12px",
    borderRadius: "9px", border: "1.5px solid #e2e8f0",
    fontSize: "13px", color: "#0f172a",
    backgroundColor: "white", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s",
  },
  textarea: {
    width: "100%", padding: "10px 12px",
    borderRadius: "9px", border: "1.5px solid #e2e8f0",
    fontSize: "13px", color: "#0f172a",
    backgroundColor: "white", outline: "none",
    boxSizing: "border-box", resize: "none",
    fontFamily: "inherit",
  },
  metodosGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
  },
  metodoBtn: {
    padding: "8px 10px", borderRadius: "8px",
    border: "1.5px solid", fontSize: "12px",
    cursor: "pointer", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: "4px",
    justifyContent: "center",
  },
  errorBox: {
    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "10px 12px",
    fontSize: "12px", color: "#b91c1c",
  },
  btnConfirmar: {
    width: "100%", padding: "13px",
    backgroundColor: "#3674B5", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700",
    transition: "opacity 0.2s",
  },
  btnVaciar: {
    width: "100%", padding: "10px",
    background: "transparent", color: "#94a3b8",
    border: "none", fontSize: "12px",
    cursor: "pointer", textDecoration: "underline",
  },
};
