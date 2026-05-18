import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PASARELAS = [
  {
    key: "stripe",
    nombre: "Stripe",
    descripcion: "Pagos con tarjeta de crédito y débito a nivel mundial. Integración activa en la tienda online.",
    estado: "activo",
    color: "#635BFF",
    colorLight: "#EEF0FF",
    colorBorder: "#C7C4FF",
    logo: StripeIcon,
    features: ["Tarjetas Visa / Mastercard", "Pagos seguros con 3D Secure", "Soporte COP"],
  },
  {
    key: "wompi",
    nombre: "Wompi",
    descripcion: "Pasarela de pagos colombiana de Bancolombia. Acepta tarjetas, PSE, Nequi y Bancolombia.",
    estado: "proximamente",
    color: "#00B0C8",
    colorLight: "#E6F8FB",
    colorBorder: "#9AE3EE",
    logo: WompiIcon,
    features: ["PSE", "Nequi", "Bancolombia Transfer", "Tarjetas"],
  },
  {
    key: "mercadopago",
    nombre: "Mercado Pago",
    descripcion: "La plataforma de pagos de Mercado Libre. Amplia cobertura en Colombia y Latinoamérica.",
    estado: "proximamente",
    color: "#00B1EA",
    colorLight: "#E5F6FD",
    colorBorder: "#94D8F5",
    logo: MercadoPagoIcon,
    features: ["Tarjetas crédito / débito", "Cuotas sin interés", "PSE"],
  },
];

export default function Integraciones() {
  const [probando, setProbando]     = useState(false);
  const [resultadoTest, setResultado] = useState(null);
  const [verClave, setVerClave]     = useState(false);

  const clavePublica = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
  const claveOculta  = clavePublica
    ? clavePublica.slice(0, 12) + "••••••••••••••••••••" + clavePublica.slice(-4)
    : "No configurada";

  const probarStripe = async () => {
    setProbando(true);
    setResultado(null);
    try {
      const res = await fetch(`${API}/api/pagos/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }),
      });
      if (res.ok) {
        setResultado({ ok: true, msg: "Conexión exitosa con Stripe ✓" });
      } else {
        setResultado({ ok: false, msg: "Error al conectar con Stripe" });
      }
    } catch {
      setResultado({ ok: false, msg: "No se pudo alcanzar el servidor" });
    } finally {
      setProbando(false);
    }
  };

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Integraciones</h2>
          <p style={s.subtitle}>Gestiona las pasarelas de pago disponibles para tu tienda</p>
        </div>
      </div>

      {/* Cards */}
      <div style={s.grid}>
        {PASARELAS.map((p) => {
          const Logo = p.logo;
          const activo = p.estado === "activo";
          return (
            <div key={p.key} style={{ ...s.card, borderColor: activo ? p.colorBorder : "#e2e8f0" }}>

              {/* Card header */}
              <div style={s.cardTop}>
                <div style={{ ...s.logoWrap, background: p.colorLight, border: `1px solid ${p.colorBorder}` }}>
                  <Logo color={p.color} />
                </div>
                <div style={s.cardTitleWrap}>
                  <h3 style={s.cardTitle}>{p.nombre}</h3>
                  <span style={{
                    ...s.estadoBadge,
                    background: activo ? "#DCFCE7" : "#F1F5F9",
                    color: activo ? "#166534" : "#64748b",
                    border: `1px solid ${activo ? "#BBF7D0" : "#e2e8f0"}`,
                  }}>
                    {activo ? "● Activo" : "Próximamente"}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <p style={s.cardDesc}>{p.descripcion}</p>

              {/* Features */}
              <div style={s.featuresList}>
                {p.features.map((f) => (
                  <span key={f} style={{ ...s.featureTag, background: p.colorLight, color: p.color, border: `1px solid ${p.colorBorder}` }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Panel Stripe activo */}
              {activo && (
                <div style={s.stripePanel}>
                  <div style={s.claveRow}>
                    <span style={s.claveLabel}>Clave pública</span>
                    <div style={s.claveValWrap}>
                      <code style={s.claveVal}>
                        {verClave ? clavePublica : claveOculta}
                      </code>
                      <button style={s.verBtn} onClick={() => setVerClave(!verClave)}>
                        {verClave ? "Ocultar" : "Ver"}
                      </button>
                    </div>
                  </div>

                  <div style={s.claveRow}>
                    <span style={s.claveLabel}>Clave secreta</span>
                    <div style={s.claveValWrap}>
                      <code style={s.claveVal}>sk_test_••••••••••••••••••••••••••••••••••••</code>
                    </div>
                  </div>

                  <div style={s.testRow}>
                    <button
                      style={{ ...s.testBtn, opacity: probando ? 0.7 : 1 }}
                      onClick={probarStripe}
                      disabled={probando}
                    >
                      {probando ? "Probando conexión…" : "⚡ Probar conexión"}
                    </button>
                    {resultadoTest && (
                      <span style={{
                        ...s.testResult,
                        color: resultadoTest.ok ? "#166534" : "#991b1b",
                        background: resultadoTest.ok ? "#DCFCE7" : "#FEE2E2",
                        border: `1px solid ${resultadoTest.ok ? "#BBF7D0" : "#FECACA"}`,
                      }}>
                        {resultadoTest.msg}
                      </span>
                    )}
                  </div>

                  <p style={s.modoTest}>
                    🔒 Modo prueba activo — usa la tarjeta <strong>4242 4242 4242 4242</strong> para testear
                  </p>
                </div>
              )}

              {/* Próximamente */}
              {!activo && (
                <div style={s.proximamente}>
                  <span style={s.proximamenteText}>
                    Esta integración estará disponible próximamente
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Íconos ──────────────────────────────────────────────────────────────────

function StripeIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill={color} />
      <path d="M13.2 10.8c0-.7.6-1 1.5-1 1.3 0 2.9.4 4.2 1.1V7.4A11.2 11.2 0 0 0 14.7 7c-3.5 0-5.8 1.8-5.8 4.9 0 4.8 6.6 4 6.6 6.1 0 .8-.7 1.1-1.7 1.1-1.5 0-3.3-.6-4.8-1.5v3.5c1.6.7 3.3 1 4.8 1 3.6 0 6.1-1.8 6.1-4.9-.1-5.1-6.7-4.2-6.7-6.4z" fill="#fff"/>
    </svg>
  );
}

function WompiIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill={color} />
      <text x="14" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">W</text>
    </svg>
  );
}

function MercadoPagoIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill={color} />
      <text x="14" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">MP</text>
    </svg>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  root: { padding: 28, fontFamily: "'Sora', 'Inter', sans-serif", minHeight: "100%" },

  header: { marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, color: "#0B1628", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", margin: "4px 0 0" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 },

  card: {
    background: "#fff", borderRadius: 16,
    border: "1.5px solid", padding: 24,
    display: "flex", flexDirection: "column", gap: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  cardTop: { display: "flex", alignItems: "center", gap: 14 },
  logoWrap: { width: 52, height: 52, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitleWrap: { display: "flex", flexDirection: "column", gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: "#0B1628", margin: 0 },
  estadoBadge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, display: "inline-block", width: "fit-content" },

  cardDesc: { fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 },

  featuresList: { display: "flex", flexWrap: "wrap", gap: 6 },
  featureTag: { fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },

  stripePanel: { display: "flex", flexDirection: "column", gap: 12, background: "#f8faf9", borderRadius: 12, padding: 16, border: "1px solid #e8f0ed" },
  claveRow: { display: "flex", flexDirection: "column", gap: 4 },
  claveLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  claveValWrap: { display: "flex", alignItems: "center", gap: 8 },
  claveVal: { fontSize: 11, color: "#374151", background: "#f1f5f9", padding: "5px 10px", borderRadius: 7, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  verBtn: { fontSize: 11, fontWeight: 600, color: "#3674B5", background: "none", border: "none", cursor: "pointer", flexShrink: 0 },

  testRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  testBtn: { padding: "8px 16px", background: "#3674B5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  testResult: { fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8 },

  modoTest: { fontSize: 11, color: "#64748b", margin: 0, background: "#fffbeb", padding: "8px 12px", borderRadius: 8, border: "1px solid #fde68a" },

  proximamente: { background: "#f8fafc", borderRadius: 10, padding: "14px 16px", border: "1px dashed #cbd5e1", textAlign: "center" },
  proximamenteText: { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
};
