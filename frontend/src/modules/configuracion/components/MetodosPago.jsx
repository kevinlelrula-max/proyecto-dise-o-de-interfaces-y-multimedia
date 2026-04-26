const ICONOS = {
  efectivo:      { emoji: "💵", bg: "bg-emerald-50",  text: "text-emerald-700" },
  transferencia: { emoji: "🏦", bg: "bg-blue-50",     text: "text-blue-700"    },
  nequi:         { emoji: "📱", bg: "bg-purple-50",   text: "text-purple-700"  },
  tarjeta:       { emoji: "💳", bg: "bg-amber-50",    text: "text-amber-700"   },
};

export default function MetodosPago({ metodos, onToggle }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-base font-semibold text-gray-700 mb-1">
        Métodos de pago disponibles
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Activa o desactiva los métodos que acepta esta empresa en el punto de venta
      </p>

      <div className="flex flex-col gap-3">
        {metodos.map((metodo) => {
          const icono = ICONOS[metodo.key] || { emoji: "💰", bg: "bg-gray-50", text: "text-gray-700" };

          return (
            <div
              key={metodo.key}
              className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition"
            >
              {/* Izquierda: icono + info */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${icono.bg} flex items-center justify-center text-lg`}>
                  {icono.emoji}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{metodo.label}</p>
                  <p className="text-xs text-gray-400">{metodo.descripcion}</p>
                </div>
              </div>

              {/* Derecha: badge + toggle */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    metodo.activo
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {metodo.activo ? "Activo" : "Inactivo"}
                </span>

                {/* Toggle */}
                <button
                  onClick={() => onToggle(metodo.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    metodo.activo ? "bg-cyan-500" : "bg-gray-200"
                  }`}
                  aria-label={`${metodo.activo ? "Desactivar" : "Activar"} ${metodo.label}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      metodo.activo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}