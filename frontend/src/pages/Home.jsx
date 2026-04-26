import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📦",
      title: "Inventario",
      desc: "Control de productos y stock en tiempo real con alertas automáticas.",
      color: "#0F6E56",
      bg: "#E1F5EE",
    },
    {
      icon: "💰",
      title: "Ventas",
      desc: "Punto de venta, historial de transacciones y control de ingresos.",
      color: "#1e40af",
      bg: "#eff6ff",
    },
    {
      icon: "👥",
      title: "Usuarios",
      desc: "Roles, permisos y accesos diferenciados por empresa.",
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      icon: "🏢",
      title: "Multiempresa",
      desc: "Cada empresa tiene su propio espacio aislado y seguro.",
      color: "#b45309",
      bg: "#fffbeb",
    },
    {
      icon: "📊",
      title: "Reportes",
      desc: "Análisis de ventas, tendencias y métricas clave del negocio.",
      color: "#0e7490",
      bg: "#ecfeff",
    },
    {
      icon: "🔒",
      title: "Seguridad",
      desc: "Autenticación por empresa con tokens seguros y sesiones controladas.",
      color: "#be185d",
      bg: "#fdf2f8",
    },
  ];

  const stats = [
    { n: "500+", label: "Empresas activas" },
    { n: "99.9%", label: "Disponibilidad" },
    { n: "24/7", label: "Soporte técnico" },
    { n: "0", label: "Pérdida de datos" },
  ];

  const steps = [
    { n: "01", title: "Crea tu cuenta", desc: "Registra tu empresa en minutos. Sin tarjeta requerida." },
    { n: "02", title: "Configura tu negocio", desc: "Agrega productos, usuarios y define roles de acceso." },
    { n: "03", title: "Empieza a gestionar", desc: "Controla ventas, inventario y clientes desde un solo panel." },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>

      {/* ── NAVBAR ── */}
      <nav style={n.nav}>
        <div style={n.navInner}>
          <div style={n.brand}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#0F6E56"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={n.brandName}>WareFish</span>
          </div>
          <div style={n.navLinks}>
            <a href="#features" style={n.navLink}>Características</a>
            <a href="#how" style={n.navLink}>Cómo funciona</a>
            <button onClick={() => navigate("/empresa/login")} style={n.btnOutline}>
              Iniciar sesión
            </button>
            <button onClick={() => navigate("/empresa/registro")} style={n.btnPrimary}>
              Registrarse gratis
            </button>
          </div>
        </div>
      </nav>

      { /* ── HERO ── */}
      <section style={h.section}>
        {/* fondo decorativo */}
        <div style={h.glow1} />
        <div style={h.glow2} />

        <div style={h.inner}>
          {/* texto */}
          <motion.div style={h.textCol} {...fadeUp(0)}>
            <div style={h.badge}>🚀 Plataforma SaaS multi-empresa</div>
            <h1 style={h.title}>
              Gestiona tu empresa<br />
              <span style={h.titleAccent}>sin límites</span>
            </h1>
            <p style={h.subtitle}>
              Productos, ventas, clientes y usuarios — todo desde un panel intuitivo,
              seguro y diseñado para crecer con tu negocio.
            </p>
            <div style={h.ctas}>
              <button onClick={() => navigate("/empresa/registro")} style={h.ctaPrimary}>
                Crear cuenta gratis →
              </button>
              <button onClick={() => navigate("/empresa/login")} style={h.ctaSecondary}>
                Iniciar sesión
              </button>
            </div>
            <div style={h.trust}>
              <span style={h.trustDot} />
              <span style={h.trustText}>Sin tarjeta de crédito · Configuración en 5 minutos</span>
            </div>
          </motion.div>

          {/* imagen */}
          <motion.div style={h.imgCol} {...fadeUp(0.2)}>
            <div style={h.imgFrame}>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80"
                alt="Dashboard FishWare"
                style={h.img}
              />
              {/* badge flotante */}
              <div style={h.floatBadge}>
                <span style={{ fontSize: "18px" }}>📈</span>
                <div>
                  <div style={h.floatTitle}>Ventas hoy</div>
                  <div style={h.floatValue}>+34% vs ayer</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={st.section}>
        <div style={st.inner}>
          {stats.map((s, i) => (
            <motion.div key={i} style={st.item} {...fadeIn(i * 0.1)}>
              <span style={st.num}>{s.n}</span>
              <span style={st.label}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={f.section}>
        <motion.div style={f.header} {...fadeUp(0)}>
          <div style={f.badge}>Funcionalidades</div>
          <h2 style={f.title}>Todo lo que tu empresa necesita</h2>
          <p style={f.subtitle}>Una plataforma completa para gestionar cada aspecto de tu negocio.</p>
        </motion.div>

        <div style={f.grid}>
          {features.map((feat, i) => (
            <motion.div
              key={i}
              style={f.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            >
              <div style={{ ...f.iconWrap, backgroundColor: feat.bg }}>
                <span style={{ fontSize: "22px" }}>{feat.icon}</span>
              </div>
              <h3 style={{ ...f.cardTitle, color: feat.color }}>{feat.title}</h3>
              <p style={f.cardDesc}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STORYTELLING ── */}
      <section style={sy.section}>
        <div style={sy.inner}>
          <motion.div style={sy.text} {...slideLeft(0)}>
            <div style={f.badge}>Control total</div>
            <h2 style={sy.title}>Un panel para gobernarlos a todos</h2>
            <p style={sy.desc}>
              Visualiza ventas, gestiona inventario y toma decisiones en tiempo real.
              Sin hojas de cálculo, sin caos, sin pérdida de información.
            </p>
            <ul style={sy.list}>
              {[
                "Stock actualizado automáticamente con cada venta",
                "Reportes exportables por período o categoría",
                "Multiusuario con roles diferenciados por empresa",
                "Historial completo de transacciones y clientes",
              ].map((item, i) => (
                <li key={i} style={sy.listItem}>
                  <span style={sy.check}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/empresa/registro")} style={sy.cta}>
              Empezar ahora →
            </button>
          </motion.div>

          <motion.div style={sy.imgWrap} {...slideRight(0.1)}>
            <img
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&q=80"
              alt="Panel de control"
              style={sy.img}
            />
          </motion.div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="how" style={hw.section}>
        <motion.div style={f.header} {...fadeUp(0)}>
          <div style={{ ...f.badge, color: "#0F6E56", borderColor: "#9FE1CB", backgroundColor: "#E1F5EE" }}>
            Proceso
          </div>
          <h2 style={f.title}>Listo en 3 pasos</h2>
          <p style={f.subtitle}>Configura tu empresa y empieza a operar en minutos.</p>
        </motion.div>

        <div style={hw.steps}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              style={hw.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div style={hw.stepNum}>{step.n}</div>
              <h3 style={hw.stepTitle}>{step.title}</h3>
              <p style={hw.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={ct.section}>
        <motion.div style={ct.inner} {...fadeUp(0)}>
          <h2 style={ct.title}>¿Listo para transformar tu empresa?</h2>
          <p style={ct.subtitle}>
            Únete a cientos de empresas que ya gestionan su negocio con FishWare.
          </p>
          <div style={ct.btns}>
            <button onClick={() => navigate("/empresa/registro")} style={ct.btnPrimary}>
              Crear cuenta gratis
            </button>
            <button onClick={() => navigate("/empresa/login")} style={ct.btnOutline}>
              Ya tengo cuenta
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={fo.footer}>
        <div style={fo.inner}>
          <div style={fo.brand}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#0F6E56"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={fo.brandName}>FishWare</span>
          </div>
          <span style={fo.copy}>© 2026 FishWare · Plataforma empresarial</span>
        </div>
      </footer>

    </div>
  );
}

/* ─── ESTILOS ─── */

const n = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "0 32px", height: "64px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandName: { fontSize: "20px", fontWeight: "700", color: "white", letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "8px" },
  navLink: {
    color: "rgba(255,255,255,0.65)", fontSize: "14px",
    textDecoration: "none", padding: "6px 14px",
    borderRadius: "8px", transition: "color 0.2s",
  },
  btnOutline: {
    padding: "8px 18px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px",
    color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "500",
  },
  btnPrimary: {
    padding: "8px 20px", backgroundColor: "#2563eb",
    border: "none", borderRadius: "8px",
    color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "600",
  },
};

const h = {
  section: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 50%, #0f1f2e 100%)",
    display: "flex", alignItems: "center",
    padding: "80px 32px",
    position: "relative", overflow: "hidden",
  },
  glow1: {
    position: "absolute", top: "-200px", left: "-200px",
    width: "600px", height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute", bottom: "-200px", right: "-100px",
    width: "500px", height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  inner: {
    maxWidth: "1200px", margin: "0 auto", width: "100%",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "64px", alignItems: "center",
    position: "relative", zIndex: 1,
  },
  textCol: {},
  badge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "5px 14px", borderRadius: "999px",
    border: "1px solid rgba(37,99,235,0.4)",
    color: "#93c5fd", fontSize: "13px", fontWeight: "500",
    marginBottom: "20px",
    backgroundColor: "rgba(37,99,235,0.08)",
  },
  title: {
    fontSize: "52px", fontWeight: "800", color: "white",
    lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "20px",
  },
  titleAccent: { color: "#60a5fa" },
  subtitle: {
    fontSize: "17px", color: "rgba(255,255,255,0.65)",
    lineHeight: "1.7", marginBottom: "32px", maxWidth: "440px",
  },
  ctas: { display: "flex", gap: "12px", marginBottom: "20px" },
  ctaPrimary: {
    padding: "13px 28px", backgroundColor: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
  ctaSecondary: {
    padding: "13px 28px", background: "transparent",
    color: "white", border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px", fontSize: "15px", cursor: "pointer",
  },
  trust: { display: "flex", alignItems: "center", gap: "8px" },
  trustDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    backgroundColor: "#60a5fa", display: "inline-block",
  },
  trustText: { fontSize: "13px", color: "rgba(255,255,255,0.45)" },
  imgCol: { position: "relative" },
  imgFrame: {
    borderRadius: "16px", overflow: "visible",
    position: "relative",
  },
  img: {
    width: "100%", borderRadius: "16px",
    boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
    display: "block",
  },
  floatBadge: {
    position: "absolute", bottom: "-18px", left: "-18px",
    backgroundColor: "white", borderRadius: "12px",
    padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  floatTitle: { fontSize: "11px", color: "#64748b", fontWeight: "500" },
  floatValue: { fontSize: "14px", fontWeight: "700", color: "#0F6E56" },
};

const st = {
  section: {
    backgroundColor: "#0f172a",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "32px 32px",
  },
  inner: {
    maxWidth: "900px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0",
  },
  item: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "4px", padding: "16px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  num: { fontSize: "32px", fontWeight: "800", color: "#60a5fa" },
  label: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
};

const f = {
  section: {
    padding: "96px 32px", backgroundColor: "#f8fafc",
  },
  header: {
    textAlign: "center", marginBottom: "56px",
  },
  badge: {
    display: "inline-block", padding: "4px 14px",
    borderRadius: "999px", border: "1px solid #e2e8f0",
    color: "#64748b", fontSize: "12px", fontWeight: "600",
    marginBottom: "14px", backgroundColor: "white",
    letterSpacing: "0.04em", textTransform: "uppercase",
  },
  title: {
    fontSize: "36px", fontWeight: "800", color: "#0f172a",
    letterSpacing: "-0.02em", marginBottom: "12px",
  },
  subtitle: { fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto" },
  grid: {
    maxWidth: "1100px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  card: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px 24px", border: "1px solid #e2e8f0",
    cursor: "default", transition: "all 0.2s",
  },
  iconWrap: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "16px",
  },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  cardDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const sy = {
  section: { padding: "96px 32px", backgroundColor: "white" },
  inner: {
    maxWidth: "1100px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "80px", alignItems: "center",
  },
  text: {},
  title: {
    fontSize: "36px", fontWeight: "800", color: "#0f172a",
    lineHeight: "1.2", letterSpacing: "-0.02em",
    marginTop: "12px", marginBottom: "16px",
  },
  desc: { fontSize: "15px", color: "#64748b", lineHeight: "1.7", marginBottom: "24px" },
  list: { listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#374151" },
  check: {
    width: "20px", height: "20px", borderRadius: "50%",
    backgroundColor: "#E1F5EE", color: "#0F6E56",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px",
  },
  cta: {
    padding: "12px 28px", backgroundColor: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
  imgWrap: {},
  img: {
    width: "100%", borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  },
};

const hw = {
  section: { padding: "96px 32px", backgroundColor: "#f8fafc" },
  steps: {
    maxWidth: "900px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "32px",
  },
  step: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "32px 28px", border: "1px solid #e2e8f0",
  },
  stepNum: {
    fontSize: "36px", fontWeight: "900", color: "#eff6ff",
    WebkitTextStroke: "2px #2563eb",
    marginBottom: "16px", lineHeight: 1,
  },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const ct = {
  section: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    padding: "96px 32px",
  },
  inner: { textAlign: "center", maxWidth: "600px", margin: "0 auto" },
  title: { fontSize: "40px", fontWeight: "800", color: "white", marginBottom: "16px", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "16px", color: "rgba(255,255,255,0.72)", marginBottom: "36px", lineHeight: "1.6" },
  btns: { display: "flex", gap: "12px", justifyContent: "center" },
  btnPrimary: {
    padding: "14px 32px", backgroundColor: "white",
    color: "#1d4ed8", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
  btnOutline: {
    padding: "14px 32px", background: "transparent",
    color: "white", border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "10px", fontSize: "15px", cursor: "pointer",
  },
};

const fo = {
  footer: {
    backgroundColor: "#0f172a",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "24px 32px",
  },
  inner: {
    maxWidth: "1200px", margin: "0 auto",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "8px" },
  brandName: { fontSize: "15px", fontWeight: "700", color: "white" },
  copy: { fontSize: "13px", color: "rgba(255,255,255,0.4)" },
};
