import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Productos from "../modules/productos/Productos";
import Clientes from "../modules/clientes/Clientes";
import Usuarios from "../modules/usuarios/Usuarios";
import Ventas from "../pages/VentasEmpresa";
import Reportes from "../pages/Reportes";
import PuntoDeVenta from "../modules/pos/PuntoDeVenta";
import Configuracion from "../modules/configuracion/Configuracion";
import PedidosEmpresa from "../modules/pedidos/PedidosEmpresa";
import Integraciones from "../modules/integraciones/Integraciones";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PERMISOS = {
  1: ["productos", "clientes", "ventas", "reportes", "usuarios", "pos", "configuracion", "pedidos", "integraciones"],
  2: ["productos", "clientes", "ventas", "reportes", "usuarios", "pos", "configuracion", "pedidos", "integraciones"],
  3: ["pos", "clientes", "pedidos"],
};

const TODO_EL_MENU = [
  { key: "productos",      label: "Productos",       icon: ProductosIcon },
  { key: "clientes",       label: "Clientes",        icon: ClientesIcon },
  { key: "pedidos",        label: "Pedidos online",  icon: PedidosIcon },
  { key: "ventas",         label: "Ventas",          icon: VentasIcon },
  { key: "reportes",       label: "Reportes",        icon: ReportesIcon },
  { key: "usuarios",       label: "Usuarios",        icon: UsuariosIcon },
  { key: "pos",            label: "Punto de venta",  icon: PosIcon },
  { key: "integraciones",  label: "Integraciones",   icon: IntegracionesIcon },
];

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

// ── Íconos SVG ──────────────────────────────────────────────────────────────
function ProductosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function ClientesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function VentasIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function ReportesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function UsuariosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function PosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h.01M11 8h.01M15 8h.01M7 12h.01M11 12h.01M15 12h.01"/>
    </svg>
  );
}
function PedidosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function IntegracionesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="6" height="6" rx="1"/>
      <rect x="16" y="2" width="6" height="6" rx="1"/>
      <rect x="2" y="16" width="6" height="6" rx="1"/>
      <path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
      <line x1="12" y1="13" x2="12" y2="16"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function DashboardEmpresa() {
  const navigate      = useNavigate();
  const token         = localStorage.getItem("token");
  const decoded       = decodeToken(token);
  const rolId         = decoded?.rol_id;
  const nombreUsuario = decoded?.usuario || "Usuario";

  // 🔒 Protección de ruta: si no hay token válido de empresa, redirigir al login
  if (!token || !decoded || !rolId || rolId === 4) {
    navigate("/empresa/login");
    return null;
  }

  const menu = TODO_EL_MENU.filter(item =>
    (PERMISOS[rolId] || []).includes(item.key)
  );

  const [seccion, setSeccion]             = useState(menu[0]?.key || "pos");
  const [open, setOpen]                   = useState(false);
  const [logoUrl, setLogoUrl]             = useState(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("FishWare");

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/configuracion`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.nombre)  setNombreEmpresa(data.nombre);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onConfigGuardada(e) {
      if (e.detail?.logoUrl) setLogoUrl(e.detail.logoUrl);
      if (e.detail?.nombre)  setNombreEmpresa(e.detail.nombre);
    }
    window.addEventListener("configuracion:guardada", onConfigGuardada);
    return () => window.removeEventListener("configuracion:guardada", onConfigGuardada);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const irA = (key) => {
    if ((PERMISOS[rolId] || []).includes(key)) setSeccion(key);
  };

  const rolLabel = rolId === 1 ? "SuperAdmin" : rolId === 2 ? "Administrador" : rolId === 3 ? "Empleado" : "Usuario";
  const inicial  = nombreUsuario.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fw-shell {
          display: flex;
          min-height: 100vh;
          background: #F0F4F8;
          font-family: 'Sora', sans-serif;
        }

        /* ── SIDEBAR ── */
        .fw-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #0B1628;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 40;
        }

        .fw-sb-top {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .fw-sb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fw-sb-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00C9A7, #0099FF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .fw-sb-name {
          font-size: 15px;
          font-weight: 600;
          color: #E8F4FF;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .fw-sb-sub {
          font-size: 10px;
          color: #4A6080;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        .fw-sb-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .fw-sb-section {
          font-size: 10px;
          font-weight: 500;
          color: #2D4060;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 8px 6px;
          margin-top: 4px;
        }

        .fw-sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 400;
          color: #5A7090;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid transparent;
          background: none;
          width: 100%;
          text-align: left;
        }

        .fw-sb-item:hover {
          background: rgba(255,255,255,0.05);
          color: #C8D6E5;
        }

        .fw-sb-item.fw-active {
          background: linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,153,255,0.12));
          border-color: rgba(0,201,167,0.25);
          color: #fff;
          font-weight: 500;
        }

        .fw-sb-item.fw-active .fw-sb-icon {
          background: linear-gradient(135deg, #00C9A7, #0099FF);
          border-color: transparent;
        }

        .fw-sb-icon {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .fw-sb-bottom {
          padding: 16px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .fw-sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
        }

        .fw-sb-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00C9A7, #0099FF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }

        .fw-sb-uname {
          font-size: 12px;
          font-weight: 500;
          color: #C8D6E5;
          line-height: 1.3;
        }

        .fw-sb-urole {
          font-size: 10px;
          color: #00C9A7;
          margin-top: 1px;
        }

        /* ── MAIN ── */
        .fw-main {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ── TOPBAR ── */
        .fw-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(240,244,248,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 0 28px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .fw-topbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fw-breadcrumb {
          font-size: 13px;
          color: #8A9BB0;
        }

        .fw-page-title {
          font-size: 15px;
          font-weight: 600;
          color: #0B1628;
          letter-spacing: -0.02em;
        }

        .fw-topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fw-notif-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #5A7090;
          position: relative;
          transition: all 0.15s;
        }

        .fw-notif-btn:hover {
          background: #f5f7fa;
          color: #0B1628;
        }

        .fw-notif-dot {
          width: 7px;
          height: 7px;
          background: #00C9A7;
          border-radius: 50%;
          position: absolute;
          top: 7px;
          right: 7px;
          border: 1.5px solid #F0F4F8;
        }

        .fw-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .fw-user-btn:hover {
          background: #f5f7fa;
          border-color: rgba(0,0,0,0.12);
        }

        .fw-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: linear-gradient(135deg, #00C9A7, #0099FF);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }

        .fw-user-name {
          font-size: 13px;
          font-weight: 500;
          color: #0B1628;
        }

        .fw-user-chevron {
          color: #8A9BB0;
          margin-left: 2px;
        }

        /* ── DROPDOWN ── */
        .fw-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 200px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          z-index: 100;
        }

        .fw-dropdown-header {
          padding: 12px 14px;
          border-bottom: 1px solid #F0F4F8;
        }

        .fw-dropdown-uname {
          font-size: 13px;
          font-weight: 500;
          color: #0B1628;
        }

        .fw-dropdown-role {
          font-size: 11px;
          color: #00A884;
          margin-top: 2px;
        }

        .fw-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #3D5068;
          cursor: pointer;
          transition: background 0.1s;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .fw-dropdown-item:hover {
          background: #F5F7FA;
          color: #0B1628;
        }

        .fw-dropdown-item.danger {
          color: #E24B4A;
        }

        .fw-dropdown-item.danger:hover {
          background: #FFF0F0;
        }

        .fw-dropdown-divider {
          height: 1px;
          background: #F0F4F8;
          margin: 4px 0;
        }

        /* ── CONTENT ── */
        .fw-content {
          flex: 1;
          padding: 24px 28px;
        }

        .fw-content-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          min-height: calc(100vh - 108px);
          overflow: hidden;
        }
      `}</style>

      <div className="fw-shell">

        {/* ── SIDEBAR ── */}
        <aside className="fw-sidebar">
          <div className="fw-sb-top">
            <div className="fw-sb-brand">
              {logoUrl ? (
                <img
                  src={`${BASE_URL}${logoUrl}`}
                  alt="Logo"
                  style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 2 }}
                />
              ) : (
                <div className="fw-sb-logo">🐟</div>
              )}
              <div>
                <div className="fw-sb-name">{nombreEmpresa}</div>
                <div className="fw-sb-sub">Panel de gestión</div>
              </div>
            </div>
          </div>

          <nav className="fw-sb-nav">
            <div className="fw-sb-section">Principal</div>
            {menu.filter(i => ["productos","clientes","pedidos","ventas","reportes","integraciones"].includes(i.key)).map(item => {
              const Icon = item.icon;
              const active = seccion === item.key;
              return (
                <button key={item.key} className={`fw-sb-item ${active ? "fw-active" : ""}`} onClick={() => irA(item.key)}>
                  <div className="fw-sb-icon">
                    <Icon active={active} />
                  </div>
                  {item.label}
                </button>
              );
            })}

            {menu.some(i => ["usuarios","pos"].includes(i.key)) && (
              <div className="fw-sb-section">Operaciones</div>
            )}
            {menu.filter(i => ["usuarios","pos"].includes(i.key)).map(item => {
              const Icon = item.icon;
              const active = seccion === item.key;
              return (
                <button key={item.key} className={`fw-sb-item ${active ? "fw-active" : ""}`} onClick={() => irA(item.key)}>
                  <div className="fw-sb-icon">
                    <Icon active={active} />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="fw-sb-bottom">
            <div className="fw-sb-user">
              <div className="fw-sb-avatar">{inicial}</div>
              <div>
                <div className="fw-sb-uname">{nombreUsuario}</div>
                <div className="fw-sb-urole">{rolLabel}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="fw-main">

          {/* TOPBAR */}
          <div className="fw-topbar">
            <div className="fw-topbar-left">
              <span className="fw-breadcrumb">FishWare</span>
              <span className="fw-breadcrumb" style={{ margin: "0 4px" }}>›</span>
              <span className="fw-page-title">
                {menu.find(m => m.key === seccion)?.label || seccion}
              </span>
            </div>

            <div className="fw-topbar-right">
              <div className="fw-notif-btn">
                <BellIcon />
                <div className="fw-notif-dot" />
              </div>

              <div
                className="fw-user-btn"
                onClick={e => { e.stopPropagation(); setOpen(!open); }}
              >
                <div className="fw-user-avatar">{inicial}</div>
                <span className="fw-user-name">{nombreUsuario}</span>
                <span className="fw-user-chevron"><ChevronIcon /></span>

                {open && (
                  <div className="fw-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="fw-dropdown-header">
                      <div className="fw-dropdown-uname">{nombreUsuario}</div>
                      <div className="fw-dropdown-role">{rolLabel}</div>
                    </div>

                    <button
                      className="fw-dropdown-item"
                      onClick={() => { setOpen(false); navigate("/perfil"); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Mi perfil
                    </button>

                    {(rolId === 1 || rolId === 2) && (
                      <button
                        className="fw-dropdown-item"
                        onClick={() => { setOpen(false); irA("configuracion"); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Configuración
                      </button>
                    )}

                    <div className="fw-dropdown-divider" />

                    <button
                      className="fw-dropdown-item danger"
                      onClick={() => { localStorage.clear(); navigate("/"); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="fw-content">
            <div className="fw-content-card">
              {seccion === "productos"     && <Productos />}
              {seccion === "clientes"      && <Clientes />}
              {seccion === "pedidos"        && <PedidosEmpresa />}
              {seccion === "integraciones" && <Integraciones />}
              {seccion === "ventas"        && <Ventas />}
              {seccion === "reportes"      && <Reportes />}
              {seccion === "usuarios"      && <Usuarios />}
              {seccion === "pos"           && <PuntoDeVenta />}
              {seccion === "configuracion" && <Configuracion />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}