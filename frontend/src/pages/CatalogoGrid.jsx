import ProductoCard from "./ProductoCard";

export default function CatalogoGrid({ productos, loading, busqueda, onAgregar }) {

  // ── Skeleton mientras carga
  if (loading) {
    return (
      <div style={s.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={s.skeleton} />
        ))}
      </div>
    );
  }

  // ── Sin resultados
  if (productos.length === 0) {
    return (
      <div style={s.empty}>
        <span style={s.emptyIcon}>🔍</span>
        <p style={s.emptyTitle}>
          {busqueda
            ? `No encontramos productos para "${busqueda}"`
            : "Esta empresa no tiene productos disponibles aún"}
        </p>
        {busqueda && (
          <p style={s.emptyDesc}>Intenta con otro nombre</p>
        )}
      </div>
    );
  }

  return (
    <div style={s.grid}>
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          onAgregar={onAgregar}
        />
      ))}
    </div>
  );
}

const s = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "20px",
  },
  skeleton: {
    height: "300px",
    borderRadius: "16px",
    backgroundColor: "#e2e8f0",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  empty: {
    textAlign: "center",
    padding: "80px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#64748b",
    maxWidth: "320px",
    lineHeight: "1.5",
  },
  emptyDesc: {
    fontSize: "13px",
    color: "#94a3b8",
  },
};
