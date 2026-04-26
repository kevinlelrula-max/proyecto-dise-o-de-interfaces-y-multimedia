const API_BASE = "http://localhost:3000";
const IMG_PLACEHOLDER = "https://placehold.co/300x200/E1F5EE/0F6E56?text=🐟";

export default function ProductGrid({ productos, agregarProducto, busqueda, setBusqueda }) {

  const productosFiltrados = (productos || []).filter((p) => {
    if (!p || !p.nombre) return false;

    return p.nombre
      .toLowerCase()
      .includes((busqueda || "").toLowerCase());
  });

  return (
    <div className="pos-left">
      
      {/* 🔍 Buscador */}
      <div className="pos-search-bar">
        <input
          placeholder="Buscar producto..."
          value={busqueda || ""}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* 🧱 Grid */}
      <div className="pos-product-grid">
        {productosFiltrados.map(p => (
          <div
            key={p.id}
            className={`prod-card ${p.stock <= 0 ? "agotado" : ""}`}
            onClick={() => p.stock > 0 && agregarProducto(p)}
          >
            {/* 🖼️ IMAGEN */}
            <img
              src={p.imagen_url ? `${API_BASE}${p.imagen_url}` : IMG_PLACEHOLDER}
              alt={p.nombre}
              className="prod-card-img"
              onError={(e) => e.target.src = IMG_PLACEHOLDER}
            />

            {/* 📦 Info */}
            <h3>{p.nombre}</h3>
            <div className="precio">
              ${Number(p.precio).toLocaleString("es-CO")}
            </div>
            <div className="stock">
              Stock: {p.stock}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}