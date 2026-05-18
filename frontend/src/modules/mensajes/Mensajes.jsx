import { useState, useEffect } from "react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatFechaCorta(iso) {
  const d   = new Date(iso);
  const hoy = new Date();
  if (d.toDateString() === hoy.toDateString())
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonItem() {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "55%", height: 12, borderRadius: 4, background: "#e2e8f0", marginBottom: 7 }} />
        <div style={{ width: "85%", height: 10, borderRadius: 4, background: "#f1f5f9" }} />
      </div>
    </div>
  );
}

export default function Mensajes() {
  const token = localStorage.getItem("token");
  const [mensajes,     setMensajes]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => { cargarMensajes(); }, []);

  const cargarMensajes = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API_URL}/contacto`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMensajes(Array.isArray(data) ? data : []);
    } catch {
      setMensajes([]);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeido = async (id) => {
    try {
      await fetch(`${API_URL}/contacto/${id}/leido`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m));
    } catch {}
  };

  const abrirMensaje = (m) => {
    setSeleccionado(m);
    if (!m.leido) marcarLeido(m.id);
  };

  const noLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <>
      <style>{`
        @keyframes itemIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes detailIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        .msg-item {
          transition: background 0.15s, border-color 0.15s, transform 0.1s !important;
        }
        .msg-item:hover {
          background: #f8fafc !important;
          transform: translateX(2px) !important;
        }
        .msg-item.active {
          background: #EEF4FF !important;
          border-color: #3674B5 !important;
          border-left: 3px solid #3674B5 !important;
        }
        .msg-item.unread {
          background: #f0f9ff !important;
          border-color: #bae6fd !important;
        }
        .msg-item.active.unread {
          background: #EEF4FF !important;
          border-color: #3674B5 !important;
        }
      `}</style>

      <div style={s.wrap}>

        {/* HEADER */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Mensajes de contacto</h2>
            <p style={s.subtitle}>Formulario de la tienda online</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {noLeidos > 0 && (
              <div style={{ ...s.badge, animation: "badgePulse 2s ease infinite" }}>
                {noLeidos} sin leer
              </div>
            )}
            <button style={s.recargarBtn} onClick={cargarMensajes} title="Recargar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </div>

        {cargando ? (
          <div style={s.layout}>
            <div style={s.list}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ animation: `itemIn 0.3s ease ${i * 60}ms both` }}>
                  <SkeletonItem />
                </div>
              ))}
            </div>
            <div style={{ ...s.detail, alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "36px" }}>💬</span>
              <p style={{ marginTop: "12px", color: "#94a3b8", fontSize: "13px" }}>Cargando mensajes…</p>
            </div>
          </div>
        ) : mensajes.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: "48px" }}>✉️</span>
            <p style={{ marginTop: "14px", color: "#64748b", fontWeight: "600" }}>No hay mensajes aún</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>Los mensajes del formulario de la tienda aparecerán aquí</p>
          </div>
        ) : (
          <div style={s.layout}>

            {/* ── LISTA ── */}
            <div style={s.list}>
              {mensajes.map((m, idx) => {
                const activo = seleccionado?.id === m.id;
                return (
                  <button
                    key={m.id}
                    className={`msg-item${activo ? " active" : ""}${!m.leido ? " unread" : ""}`}
                    style={{
                      ...s.listItem,
                      animation: `itemIn 0.35s ease ${idx * 50}ms both`,
                      borderLeft: activo ? "3px solid #3674B5" : "3px solid transparent",
                    }}
                    onClick={() => abrirMensaje(m)}
                  >
                    <div style={{
                      ...s.listAvatar,
                      background: activo
                        ? "linear-gradient(135deg, #3674B5, #60a5fa)"
                        : !m.leido
                          ? "#3674B5"
                          : "#94a3b8",
                    }}>
                      {m.nombre?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    <div style={s.listInfo}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{ ...s.listName, fontWeight: !m.leido ? "700" : "500" }}>
                          {m.nombre}
                        </span>
                        <span style={s.listFecha}>{formatFechaCorta(m.fecha)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {!m.leido && (
                          <span style={{
                            ...s.dot,
                            animation: "dotPulse 1.8s ease infinite",
                          }} />
                        )}
                        <span style={{ ...s.listPreview, fontWeight: !m.leido ? "500" : "400", color: !m.leido ? "#475569" : "#94a3b8" }}>
                          {m.mensaje?.slice(0, 55)}{m.mensaje?.length > 55 ? "…" : ""}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── DETALLE ── */}
            <div style={s.detail}>
              {seleccionado ? (
                // key fuerza re-mount y re-animación al cambiar mensaje
                <div key={seleccionado.id} style={{ display: "flex", flexDirection: "column", height: "100%", animation: "detailIn 0.28s ease both" }}>
                  <div style={s.detailHeader}>
                    <div style={s.detailAvatar}>
                      {seleccionado.nombre?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.detailName}>{seleccionado.nombre}</div>
                      {seleccionado.email && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(seleccionado.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={s.detailEmail}
                        >
                          {seleccionado.email}
                        </a>
                      )}
                    </div>
                    <div style={s.detailFecha}>{formatFecha(seleccionado.fecha)}</div>
                  </div>

                  <div style={s.detailBody}>
                    <div style={s.detailBubble}>
                      <p style={s.detailMensaje}>{seleccionado.mensaje}</p>
                    </div>
                  </div>

                  {seleccionado.email && (
                    <div style={s.detailActions}>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(seleccionado.email)}&su=${encodeURIComponent("Re: Mensaje desde la tienda")}&body=${encodeURIComponent(`Hola ${seleccionado.nombre},\n\n`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={s.replyBtn}
                      >
                        ✉️ Responder por Gmail
                      </a>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {seleccionado.leido ? "✓ Leído" : ""}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={s.detailEmpty}>
                  <span style={{ fontSize: "44px" }}>💬</span>
                  <p style={{ marginTop: "12px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>
                    Selecciona un mensaje
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                    {mensajes.length} mensaje{mensajes.length !== 1 ? "s" : ""} · {noLeidos} sin leer
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}

const s = {
  wrap:     { padding: "28px", display: "flex", flexDirection: "column", gap: "20px", minHeight: "100%" },
  header:   { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title:    { fontSize: "20px", fontWeight: "700", color: "#0B1628", letterSpacing: "-0.02em", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  badge: {
    padding: "4px 12px", backgroundColor: "#EEF4FF", color: "#3674B5",
    borderRadius: "999px", fontSize: "12px", fontWeight: "700",
    border: "1px solid #bfdbfe", flexShrink: 0,
  },
  recargarBtn: {
    width: "32px", height: "32px", borderRadius: "8px",
    border: "1px solid #e2e8f0", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#64748b",
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "300px", color: "#94a3b8",
  },

  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "14px", flex: 1 },

  list: {
    display: "flex", flexDirection: "column", gap: "5px",
    overflowY: "auto", maxHeight: "calc(100vh - 220px)",
  },
  listItem: {
    display: "flex", alignItems: "flex-start", gap: "11px",
    padding: "12px 12px 12px 10px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    background: "white", cursor: "pointer", textAlign: "left",
    width: "100%",
  },
  listAvatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    color: "white", fontSize: "14px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background 0.2s",
  },
  listInfo:    { flex: 1, minWidth: 0 },
  listName:    { fontSize: "13px", color: "#0B1628" },
  listPreview: { fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  listFecha:   { fontSize: "10px", color: "#94a3b8", flexShrink: 0 },
  dot:         { width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#3674B5", flexShrink: 0 },

  detail: {
    background: "white", border: "1px solid #e2e8f0", borderRadius: "12px",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  detailEmpty: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  detailHeader: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
  },
  detailAvatar: {
    width: "46px", height: "46px", borderRadius: "50%",
    background: "linear-gradient(135deg, #3674B5, #60a5fa)",
    color: "white", fontSize: "18px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  detailName:  { fontSize: "15px", fontWeight: "700", color: "#0B1628" },
  detailEmail: { fontSize: "13px", color: "#3674B5", textDecoration: "none" },
  detailFecha: { marginLeft: "auto", fontSize: "12px", color: "#94a3b8", flexShrink: 0 },
  detailBody:  { padding: "22px", flex: 1, overflowY: "auto" },
  detailBubble: {
    backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "16px 20px", border: "1px solid #f1f5f9",
  },
  detailMensaje: {
    fontSize: "14px", color: "#334155", lineHeight: "1.75",
    whiteSpace: "pre-wrap", margin: 0,
  },
  detailActions: {
    padding: "14px 22px", borderTop: "1px solid #f1f5f9",
    display: "flex", alignItems: "center", gap: "12px",
  },
  replyBtn: {
    display: "inline-block", padding: "8px 18px",
    backgroundColor: "#3674B5", color: "white",
    borderRadius: "8px", fontSize: "13px", fontWeight: "600",
    textDecoration: "none",
  },
};
