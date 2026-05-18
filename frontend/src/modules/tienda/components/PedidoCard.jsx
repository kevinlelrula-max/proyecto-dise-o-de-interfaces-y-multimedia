import { useState } from "react";

const ESTADOS = {
  pendiente:       { label: "Pendiente",       color: "#b45309", bg: "#fffbeb", icon: "⏳" },
  confirmado:      { label: "Confirmado",       color: "#1e40af", bg: "#eff6ff", icon: "✅" },
  en_preparacion:  { label: "En preparación",  color: "#7c3aed", bg: "#f5f3ff", icon: "👨‍🍳" },
  enviado:         { label: "Enviado",          color: "#0e7490", bg: "#ecfeff", icon: "🚚" },
  entregado:       { label: "Entregado",        color: "#166534", bg: "#dcfce7", icon: "📦" },
  cancelado:       { label: "Cancelado",        color: "#dc2626", bg: "#fef2f2", icon: "❌" },
};

function formatPrecio(p) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(p);
}

function formatFecha(f) {
  return new Date(f).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PedidoCard({ pedido }) {
  const [expandido, setExpandido] = useState(false);
  const estado = ESTADOS[pedido.estado] || ESTADOS.pendiente;

  return (
    <div style={s.card}>
      {/* header */}
      <div style={s.header} onClick={() => setExpandido(!expandido)}>
        <div style={s.headerLeft}>
          <span style={s.icon}>{estado.icon}</span>
          <div>
            <p style={s.pedidoId}>Pedido #{pedido.id}</p>
            <p style={s.fecha}>{formatFecha(pedido.fecha_pedido)}</p>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={{ ...s.estadoBadge, color: estado.color, background: estado.bg }}>
            {estado.label}
          </span>
          <span style={s.total}>{formatPrecio(pedido.total)}</span>
          <span style={s.chevron}>{expandido ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* detalle expandible */}
      {expandido && (
        <div style={s.detalle}>
          {/* barra de progreso del estado */}
          <BarraEstado estado={pedido.estado} />

          {/* productos */}
          {pedido.detalle?.length > 0 && (
            <div style={s.productos}>
              <p style={s.seccionTitulo}>Productos</p>
              {pedido.detalle.map((d, i) => (
                <div key={i} style={s.productoRow}>
                  <span style={s.productoNombre}>{d.producto}</span>
                  <span style={s.productoKilos}>{d.kilos} kg</span>
                  <span style={s.productoSubtotal}>{formatPrecio(d.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          {/* info entrega */}
          <div style={s.infoEntrega}>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>📍 Dirección</span>
              <span style={s.infoValor}>{pedido.direccion_entrega}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>💳 Pago</span>
              <span style={s.infoValor}>{pedido.metodo_pago}</span>
            </div>
            {pedido.notas && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>📝 Notas</span>
                <span style={s.infoValor}>{pedido.notas}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Barra visual de progreso del estado
const PASOS = ["pendiente", "confirmado", "en_preparacion", "enviado", "entregado"];

function BarraEstado({ estado }) {
  if (estado === "cancelado") {
    return (
      <div style={bs.wrap}>
        <div style={bs.cancelado}>❌ Pedido cancelado</div>
      </div>
    );
  }
  const idx = PASOS.indexOf(estado);
  return (
    <>
      <style>{`
        @keyframes stepPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
      `}</style>
      <div style={bs.wrap}>
        {PASOS.map((paso, i) => {
          const info = ESTADOS[paso];
          const activo = i <= idx;
          const lineaActiva = activo && i < idx;
          return (
            <div key={paso} style={bs.paso}>
              {/* Línea conectora (detrás del círculo) */}
              {i < PASOS.length - 1 && (
                <div style={bs.lineaBase}>
                  {lineaActiva && (
                    <div style={{
                      ...bs.lineaFill,
                      animation: `lineGrow 0.5s ease ${i * 120}ms both`,
                    }} />
                  )}
                </div>
              )}

              {/* Círculo */}
              <div style={{
                ...bs.circulo,
                background: activo ? "#3674B5" : "#e2e8f0",
                color:      activo ? "white"   : "#94a3b8",
                boxShadow:  activo ? "0 0 0 3px rgba(54,116,181,0.18)" : "none",
                animation:  activo ? `stepPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 120}ms both` : "none",
              }}>
                {activo ? "✓" : i + 1}
              </div>

              <p style={{
                ...bs.pasoLabel,
                color:      activo ? "#3674B5" : "#94a3b8",
                fontWeight: activo ? 600 : 400,
              }}>
                {info.label}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

const bs = {
  wrap: { display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 20, paddingTop: 4 },
  paso: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" },
  circulo: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, zIndex: 1, marginBottom: 6,
    transition: "background 0.3s, box-shadow 0.3s",
    position: "relative",
  },
  lineaBase: {
    position: "absolute", top: 13, left: "50%", width: "100%",
    height: 2, backgroundColor: "#e2e8f0", zIndex: 0, overflow: "hidden",
  },
  lineaFill: {
    height: "100%", backgroundColor: "#3674B5",
    borderRadius: 2,
  },
  pasoLabel: { fontSize: 10, textAlign: "center", lineHeight: 1.3, transition: "color 0.3s" },
  cancelado: {
    background: "#fef2f2", color: "#dc2626",
    borderRadius: 8, padding: "8px 14px",
    fontSize: 13, fontWeight: 600,
  },
};

const s = {
  card: {
    background: "#fff",
    border: "1px solid #e8f0ed",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", cursor: "pointer",
    transition: "background 0.15s",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  icon: { fontSize: 22 },
  pedidoId: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 },
  fecha: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  estadoBadge: {
    fontSize: 11, fontWeight: 700, padding: "3px 10px",
    borderRadius: 99, letterSpacing: "0.03em",
  },
  total: { fontSize: 15, fontWeight: 800, color: "#0f172a" },
  chevron: { fontSize: 11, color: "#94a3b8" },
  detalle: {
    padding: "0 20px 20px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 16,
  },
  productos: { marginBottom: 16 },
  seccionTitulo: {
    fontSize: 11, fontWeight: 700, color: "#3674B5",
    textTransform: "uppercase", letterSpacing: "0.05em",
    margin: "0 0 10px",
  },
  productoRow: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 0", borderBottom: "1px solid #f1f5f9",
  },
  productoNombre: { flex: 1, fontSize: 13, color: "#374151" },
  productoKilos: { fontSize: 12, color: "#64748b", minWidth: 48, textAlign: "center" },
  productoSubtotal: { fontSize: 13, fontWeight: 700, color: "#0f172a", minWidth: 80, textAlign: "right" },
  infoEntrega: {
    background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  infoRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontSize: 12, color: "#64748b", minWidth: 80, flexShrink: 0 },
  infoValor: { fontSize: 13, color: "#0f172a", fontWeight: 500 },
};
