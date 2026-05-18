import ProductoCard from "../modules/tienda/components/ProductoCard";

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }) {
  const sh = {
    background: "linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)",
    backgroundSize: "200% 100%",
    animation: `shimmer 1.5s ease ${delay}ms infinite`,
    borderRadius: 4,
  };
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      border: "1px solid #e8f0ed", background: "#fff",
      display: "flex", flexDirection: "column",
    }}>
      {/* Imagen */}
      <div style={{ height: 140, ...sh, borderRadius: 0 }} />

      {/* Cuerpo */}
      <div style={{ padding: "12px 14px 8px", flex: 1 }}>
        <div style={{ ...sh, height: 14, width: "72%", marginBottom: 10 }} />
        <div style={{ ...sh, height: 20, width: "50%", marginBottom: 8 }} />
        <div style={{ ...sh, height: 10, width: "38%", background: "#f1f5f9" }} />
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 14px 14px",
        borderTop: "1px solid #f0f7f4",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ ...sh, height: 28, flex: 1, borderRadius: 6 }} />
        <div style={{ ...sh, height: 28, width: 72, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default function CatalogoGrid({ productos, loading, busqueda, onAgregar }) {

  // ── Skeleton mientras carga
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            from { background-position: 200% 0; }
            to   { background-position: -200% 0; }
          }
        `}</style>
        <div style={s.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 80} />
          ))}
        </div>
      </>
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
      {productos.map((producto, idx) => (
        <div
          key={producto.id}
          style={{ animation: `cardIn 0.38s ease ${idx * 55}ms both` }}
        >
          <style>{`
            @keyframes cardIn {
              from { opacity: 0; transform: translateY(14px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <ProductoCard
            producto={producto}
            onAgregar={onAgregar}
          />
        </div>
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
