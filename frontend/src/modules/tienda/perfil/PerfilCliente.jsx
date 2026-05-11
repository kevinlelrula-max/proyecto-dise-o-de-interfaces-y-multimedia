import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfilCliente } from "./hooks/usePerfilCliente";
import DatosPersonales from "./components/DatosPersonales";
import CambiarPassword from "./components/CambiarPassword";

const TABS = [
  { id: "datos",      label: "Mis datos" },
  { id: "password",   label: "Contraseña" },
];

export default function PerfilCliente() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("datos");

  const {
    perfil,
    cargando,
    error,
    exito,
    limpiarMensajes,
    guardarDatos,
    actualizarPassword,
  } = usePerfilCliente();

  // Si no hay sesión, redirigir
  if (!cargando && !perfil && !localStorage.getItem("cliente_token")) {
    navigate("/tienda/login");
    return null;
  }

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    localStorage.removeItem("cliente");
    navigate("/tienda");
  };

  const handleTabChange = (id) => {
    limpiarMensajes();
    setTab(id);
  };

  return (
    <div style={s.page}>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navBrand} onClick={() => navigate("/tienda")}>
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#0F6E56"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <div>
              <span style={s.navBrandName}>WareFish</span>
              <span style={s.navBrandSub}>Mi perfil</span>
            </div>
          </div>

          <div style={s.navActions}>
            <button style={s.navBtnGhost} onClick={() => navigate("/tienda")}>
              ← Volver a la tienda
            </button>
            <button style={s.navBtnGhost} onClick={() => navigate("/tienda/mis-pedidos")}>
              📦 Mis pedidos
            </button>
            <button style={s.navBtnSalir} onClick={handleCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <div style={s.container}>

        {/* Cabecera de usuario */}
        <div style={s.userCard}>
          <div style={s.userAvatar}>
            {perfil?.nombre?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div>
            <p style={s.userName}>
              {perfil ? `${perfil.nombre} ${perfil.apellido || ""}`.trim() : "—"}
            </p>
            <p style={s.userSub}>{perfil?.usuario ?? ""}</p>
          </div>
        </div>

        {/* Pestañas */}
        <div style={s.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
              onClick={() => handleTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña */}
        {cargando ? (
          <p style={s.cargando}>Cargando perfil…</p>
        ) : (
          <div style={s.tabContent}>
            {tab === "datos" && (
              <DatosPersonales
                perfil={perfil}
                onGuardar={guardarDatos}
                error={error}
                exito={exito}
              />
            )}
            {tab === "password" && (
              <CambiarPassword
                onGuardar={actualizarPassword}
                error={error}
                exito={exito}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Navbar
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  navBrandName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    display: "block",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  navBrandSub: {
    fontSize: "10px",
    color: "#34d399",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "auto",
  },
  navBtnGhost: {
    padding: "7px 14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  navBtnSalir: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
    padding: "0 4px",
  },

  // Contenido
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "0 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // Tarjeta de usuario
  userCard: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#0F6E56",
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  userSub: {
    fontSize: 13,
    color: "#64748b",
    margin: "2px 0 0",
  },

  // Tabs
  tabs: {
    display: "flex",
    gap: 0,
    borderBottom: "2px solid #f0f7f4",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    background: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "#94a3b8",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    transition: "all 0.15s",
  },
  tabActive: {
    color: "#0F6E56",
    fontWeight: 700,
    borderBottomColor: "#0F6E56",
  },

  tabContent: {},

  cargando: {
    textAlign: "center",
    color: "#64748b",
    padding: "48px 0",
    fontSize: 14,
  },
};
