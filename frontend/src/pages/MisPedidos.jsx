import { useNavigate } from "react-router-dom";
import { useMisPedidos } from "../modules/tienda/hooks/useMisPedidos";
import PedidoCard from "../modules/tienda/components/PedidoCard";

function leerSesion() {
  try {
    const raw = localStorage.getItem("cliente");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ? parsed : null;
  } catch { return null; }
}

export default function MisPedidos() {
  const navigate  = useNavigate();
  const sesion    = leerSesion();

  const { pedidos, cargando, error, ultimaVez, recargar } = useMisPedidos(sesion?.token);

  // Sin sesión → redirigir
  if (!sesion) {
    return (
      <div style={s.page}>
        <Navbar navigate={navigate} sesion={null} />
        <div style={s.centrado}>
          <span style={{ fontSize: 40 }}>🔒</span>
          <p style={s.msgTitulo}>Inicia sesión para ver tus pedidos</p>
          <button style={s.btnPrimary} onClick={() => navigate("/tienda")}>
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Navbar navigate={navigate} sesion={sesion} />

      <div style={s.contenido}>
        {/* encabezado */}
        <div style={s.encabezado}>
          <div>
            <h1 style={s.titulo}>Mis pedidos</h1>
            <p style={s.subtitulo}>
              Hola, <strong>{sesion.nombre || sesion.usuario}</strong> ·{" "}
              {ultimaVez && (
                <span style={s.ultimaVez}>
                  Actualizado {ultimaVez.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>
          <button style={s.btnRecargar} onClick={recargar} title="Actualizar">
            🔄 Actualizar
          </button>
        </div>

        {/* polling info */}
        <div style={s.pollingBanner}>
          <span style={s.pollingDot} />
          <span style={s.pollingTexto}>
            El estado se actualiza automáticamente cada 30 segundos
          </span>
        </div>

        {/* estados */}
        {cargando && (
          <div style={s.centrado}>
            <p style={s.msgTexto}>Cargando pedidos…</p>
          </div>
        )}

        {error && (
          <div style={s.centrado}>
            <p style={{ ...s.msgTexto, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {!cargando && !error && pedidos.length === 0 && (
          <div style={s.centrado}>
            <span style={{ fontSize: 48 }}>📦</span>
            <p style={s.msgTitulo}>Aún no tienes pedidos</p>
            <p style={s.msgTexto}>Explora el catálogo y haz tu primer pedido</p>
            <button style={s.btnPrimary} onClick={() => navigate("/tienda")}>
              Ver catálogo
            </button>
          </div>
        )}

        {!cargando && pedidos.length > 0 && (
          <div style={s.lista}>
            {pedidos.map((p) => (
              <PedidoCard key={p.id} pedido={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Navbar reutilizada ───────────────────────────────────────────────────────
function Navbar({ navigate, sesion }) {
  const cerrarSesion = () => {
    localStorage.removeItem("cliente");
    navigate("/tienda");
  };

  return (
    <nav style={n.nav}>
      <div style={n.inner}>
        <div style={n.brand} onClick={() => navigate("/tienda")}>
          <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="9" fill="#0F6E56"/>
            <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="15" r="1.5" fill="white"/>
          </svg>
          <div>
            <span style={n.brandName}>WareFish</span>
            <span style={n.brandSub}>Tienda</span>
          </div>
        </div>

        <div style={n.actions}>
          <button style={n.btnGhost} onClick={() => navigate("/tienda")}>
            ← Volver al catálogo
          </button>
          {sesion && (
            <button style={n.btnSalir} onClick={cerrarSesion}>
              Salir
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── ESTILOS ─── */
const n = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: "900px", margin: "0 auto",
    padding: "0 24px", height: "60px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 10,
    cursor: "pointer",
  },
  brandName: { fontSize: 16, fontWeight: 700, color: "white", display: "block", lineHeight: 1.1 },
  brandSub: { fontSize: 10, color: "#34d399", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block" },
  actions: { display: "flex", alignItems: "center", gap: 8 },
  btnGhost: {
    padding: "7px 14px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
    color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer",
  },
  btnSalir: {
    background: "none", border: "none",
    color: "#94a3b8", fontSize: 12, cursor: "pointer",
  },
};

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8faf9",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  contenido: {
    maxWidth: "900px", margin: "0 auto",
    padding: "32px 24px",
  },
  encabezado: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  titulo: {
    fontSize: 26, fontWeight: 800, color: "#0f172a",
    margin: "0 0 4px", letterSpacing: "-0.02em",
  },
  subtitulo: { fontSize: 14, color: "#64748b", margin: 0 },
  ultimaVez: { color: "#94a3b8", fontWeight: 400 },
  btnRecargar: {
    padding: "8px 16px",
    background: "#fff", border: "1px solid #d1e8e0",
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    color: "#0F6E56", cursor: "pointer",
  },
  pollingBanner: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#f0f7f4", border: "1px solid #d1e8e0",
    borderRadius: 8, padding: "8px 14px", marginBottom: 24,
  },
  pollingDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#0F6E56",
    boxShadow: "0 0 0 3px rgba(15,110,86,0.2)",
    animation: "pulse 2s infinite",
    flexShrink: 0,
  },
  pollingTexto: { fontSize: 12, color: "#0F6E56", fontWeight: 500 },
  lista: { display: "flex", flexDirection: "column" },
  centrado: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 12, padding: "80px 24px", textAlign: "center",
  },
  msgTitulo: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  msgTexto: { fontSize: 14, color: "#64748b", margin: 0 },
  btnPrimary: {
    marginTop: 8, padding: "10px 24px",
    background: "#0F6E56", color: "#fff",
    border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
};
