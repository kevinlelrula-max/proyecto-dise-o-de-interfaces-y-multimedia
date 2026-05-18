import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

// ── Tipos de toast ───────────────────────────────────────────────────────────
const TIPOS = {
  success: { icon: "✅", border: "#bbf7d0", bg: "#f0fdf4", color: "#166534" },
  error:   { icon: "❌", border: "#fecaca", bg: "#fef2f2", color: "#dc2626" },
  warning: { icon: "⚠️", border: "#fde68a", bg: "#fffbeb", color: "#b45309" },
  info:    { icon: "💬", border: "#bfdbfe", bg: "#EEF4FF", color: "#3674B5" },
};

// ── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

// ── Contenedor de toasts ──────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
        @keyframes toastBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-item {
          animation: toastIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .toast-item:hover {
          filter: brightness(0.97);
        }
      `}</style>
      <div style={{
        position: "fixed", bottom: "28px", right: "28px",
        display: "flex", flexDirection: "column-reverse", gap: "10px",
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const meta = TIPOS[t.type] || TIPOS.success;
          return (
            <div
              key={t.id}
              className="toast-item"
              onClick={() => onRemove(t.id)}
              style={{
                pointerEvents: "auto",
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 16px",
                backgroundColor: meta.bg,
                border: `1px solid ${meta.border}`,
                color: meta.color,
                borderRadius: "12px",
                fontSize: "13px", fontWeight: "500",
                boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
                cursor: "pointer",
                maxWidth: "340px", minWidth: "220px",
                position: "relative", overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "17px", flexShrink: 0 }}>{meta.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.45 }}>{t.message}</span>
              <span style={{ opacity: 0.35, fontSize: "15px", flexShrink: 0, marginLeft: 4 }}>✕</span>

              {/* Barra de progreso inferior */}
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                height: "3px", borderRadius: "0 0 12px 12px",
                backgroundColor: meta.border,
                animation: "toastBar 3.5s linear forwards",
              }} />
            </div>
          );
        })}
      </div>
    </>
  );
}
