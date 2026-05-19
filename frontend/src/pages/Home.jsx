import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import { img1, img2, img3, img7, img8, img9 } from "./images";
import logoWarefish from "../assets/logowarefish.png";
import afichePesquera from "../assets/afiche.png";
import aficheSistema from "../assets/afiche_sistema.jpg";

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

const EMPRESA_SECTIONS = [
  { id: "sec-historia",   label: "Historia" },
  { id: "sec-ubicacion",  label: "Ubicación" },
  { id: "sec-portafolio", label: "Portafolio" },
  { id: "sec-actividad",  label: "Actividad" },
  { id: "sec-proceso",    label: "Proceso administrativo" },
];
const PAGE_SECTIONS = ["features", "control", "how"];

// ── URL del video publicitario ────────────────────────────────────────────────
// Opciones:
//   Video local:   VIDEO_SRC = "/video/publicitario.mp4"  (poner en public/video/)
//   YouTube embed: VIDEO_SRC = null  →  poner el ID en YOUTUBE_ID
const VIDEO_SRC    = "/video/publicitario.mp4";
const YOUTUBE_ID   = null;                    //← reemplaza con el ID de YouTube (ej: "dQw4w9WgXcQ")
const VIDEO_POSTER = null;                    // ← imagen de portada opcional (ruta local o URL)

function SeccionVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); }
    else          { videoRef.current.play();  }
    setPlaying(!playing);
  };

  // Si hay YouTube ID, embed directo
  if (YOUTUBE_ID) {
    return (
      <section style={vid.section}>
        <motion.div style={vid.inner} {...fadeUp(0)}>
          <div style={vid.tag}>🎬 Video institucional</div>
          <h2 style={vid.title}>Conoce Pesquera Estrada</h2>
          <p style={vid.subtitle}>Del Orinoco a tu mesa — pescado fresco con tradición y tecnología.</p>
          <div style={vid.frameWrap}>
            <iframe
              style={vid.iframe}
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
              title="Video publicitario Pesquera Estrada"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      </section>
    );
  }

  // Si hay video local
  if (VIDEO_SRC) {
    return (
      <section style={vid.section}>
        <motion.div style={vid.inner} {...fadeUp(0)}>
          <h2 style={vid.title}>Video promocional del sistema</h2>
          <div style={vid.playerWrap} onClick={togglePlay}>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={VIDEO_POSTER || undefined}
              style={vid.video}
              onEnded={() => setPlaying(false)}
              playsInline
              controls
            />
            {!playing && (
              <div style={vid.playOverlay}>
                <div style={vid.playBtn}>▶</div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    );
  }

  // Placeholder mientras no hay video
  return (
    <section style={vid.section}>
      <motion.div style={vid.inner} {...fadeUp(0)}>
        <div style={vid.tag}>🎬 Video institucional</div>
        <h2 style={vid.title}>Conoce Pesquera Estrada</h2>
        <p style={vid.subtitle}>Del Orinoco a tu mesa — pescado fresco con tradición y tecnología.</p>
        <div style={vid.placeholder}>
          <div style={vid.placeholderIcon}>🎬</div>
          <p style={vid.placeholderText}>Video publicitario próximamente</p>
          <p style={vid.placeholderSub}>Generado con IA · Pesquera Estrada 2026</p>
        </div>
      </motion.div>
    </section>
  );
}

function MapaInteractivo() {
  const [mapMode, setMapMode] = useState("mapa");

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-67.5068%2C6.1684%2C-67.4868%2C6.1884&layer=mapnik&marker=6.1784%2C-67.4968`;
  const osmLink = `https://www.openstreetmap.org/?mlat=6.1784&mlon=-67.4968#map=16/6.1784/-67.4968`;
  const gmapsLink = `https://maps.google.com/?q=6.178398,-67.496846`;

  return (
    <div style={mp.wrap}>
      <div style={mp.tabs}>
        {[
          { key: "mapa",     label: "🗺️ Mapa" },
          { key: "satelite", label: "🛰️ Satélite (doc)" },
          { key: "foto1",    label: "📍 Ubicación exacta" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setMapMode(t.key)}
            style={{ ...mp.tab, ...(mapMode === t.key ? mp.tabActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={mp.mapContainer}>
        {mapMode === "mapa" && (
          <>
            <iframe title="Mapa Pesquera Estrada" src={mapUrl} style={mp.iframe} allowFullScreen />
            <div style={mp.mapOverlay}>
              <span style={mp.pin}>📍</span>
              <div>
                <div style={mp.pinTitle}>Pesquera Estrada</div>
                <div style={mp.pinSub}>Barrio Calarcá · Puerto Carreño, Vichada</div>
              </div>
            </div>
          </>
        )}
        {mapMode === "satelite" && (
          <div style={mp.imgMode}>
            <img src={img2} alt="Vista satelital Puerto Carreño" style={mp.mapImg} />
            <div style={mp.imgCaption}>Vista satelital de Puerto Carreño</div>
          </div>
        )}
        {mapMode === "foto1" && (
          <div style={mp.imgMode}>
            <img src={img3} alt="Ubicación exacta Pesquera Estrada" style={mp.mapImg} />
            <div style={mp.imgCaption}>Coordenadas: 6.178398, -67.496846 · Puerto Carreño, Vichada</div>
          </div>
        )}
      </div>
      <div style={mp.links}>
        <a href={osmLink} target="_blank" rel="noopener noreferrer" style={mp.linkBtn}>🗺️ Abrir en OpenStreetMap</a>
        <a href={gmapsLink} target="_blank" rel="noopener noreferrer" style={mp.linkBtn}>📍 Ver en Google Maps</a>
      </div>
    </div>
  );
}

function BreadcrumbBar({ activePage, activeEmpresa }) {
  return (
    <div style={bc.bar}>
      <div style={bc.inner}>
        <nav style={bc.navLeft}>
          <span style={bc.prefix}>🐟 Pesquera Estrada</span>
          <span style={bc.arrow}>›</span>
          {EMPRESA_SECTIONS.map((s, i) => (
            <span key={s.id} style={bc.rowItem}>
              {i > 0 && <span style={bc.dot}>·</span>}
              <a href={`#${s.id}`} style={{ ...bc.crumb, ...(activeEmpresa === s.id ? bc.crumbActive : {}) }}>
                {s.label}
              </a>
            </span>
          ))}
        </nav>
        <nav style={bc.navRight}>
          <span style={bc.crumbDim}>WareFish</span>
          <span style={bc.arrow}>›</span>
          <span style={bc.crumbDim}>Pesquera Estrada</span>
          <span style={bc.arrow}>›</span>
          <span style={bc.crumbPage}>{activePage}</span>
        </nav>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activePage, setActivePage]       = useState("Inicio");
  const [activeEmpresa, setActiveEmpresa] = useState("sec-historia");

  useEffect(() => {
    const pageMap = { features: "Características", control: "Control total", how: "Cómo funciona" };
    const pageObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActivePage(pageMap[e.target.id] ?? "Inicio"); }),
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    PAGE_SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) pageObs.observe(el); });
    const heroObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setActivePage("Inicio"); },
      { threshold: 0.3 }
    );
    const hero = document.getElementById("hero-section");
    if (hero) heroObs.observe(hero);
    return () => { pageObs.disconnect(); heroObs.disconnect(); };
  }, []);

  useEffect(() => {
    const empObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveEmpresa(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    EMPRESA_SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) empObs.observe(el); });
    return () => empObs.disconnect();
  }, []);

  const features = [
    { icon: "📦", title: "Inventario", desc: "Control de productos y stock en tiempo real con alertas automáticas.", color: "#3674B5", bg: "#EEF4FF" },
    { icon: "💰", title: "Ventas", desc: "Punto de venta, historial de transacciones y control de ingresos.", color: "#1e40af", bg: "#eff6ff" },
    { icon: "👥", title: "Usuarios", desc: "Roles, permisos y accesos diferenciados por empresa.", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: "🏢", title: "Multiempresa", desc: "Cada empresa tiene su propio espacio aislado y seguro.", color: "#b45309", bg: "#fffbeb" },
    { icon: "📊", title: "Reportes", desc: "Análisis de ventas, tendencias y métricas clave del negocio.", color: "#0e7490", bg: "#ecfeff" },
    { icon: "🔒", title: "Seguridad", desc: "Autenticación por empresa con tokens seguros y sesiones controladas.", color: "#be185d", bg: "#fdf2f8" },
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
            <img src={logoWarefish} alt="WareFish Logo" style={{ width: 90, height: 90, objectFit: "contain" }} />
            <span style={n.brandName}>WareFish</span>
          </div>
          <div style={n.navLinks}>
            <a href="#features" style={n.navLink}>Características</a>
            <a href="#how" style={n.navLink}>Cómo funciona</a>
            {/* ── NUEVO: acceso a la tienda ── */}
            <button onClick={() => navigate("/tienda")} style={n.btnTienda}>
              🛒 Ir a la tienda
            </button>
            <button onClick={() => navigate("/empresa/login")} style={n.btnOutline}>Acceso empresa</button>
          </div>
        </div>
      </nav>

      {/* ── BREADCRUMB ── */}
      <BreadcrumbBar activePage={activePage} activeEmpresa={activeEmpresa} />

      {/* ── HERO ── */}
      <section id="hero-section" style={{ ...h.section, padding: 0, overflow: "hidden" }}>
        <div style={h.glow1} /><div style={h.glow2} />

        {/* Texto izquierda */}
        <motion.div style={{ position: "relative", zIndex: 1, flex: "0 0 50%", padding: "48px 40px 48px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }} {...fadeUp(0)}>
          <h1 style={h.title}>Tu pesquera<br /><span style={h.titleAccent}>digitalizada</span></h1>
          <p style={h.subtitle}>Inventario, ventas, clientes y pedidos en línea. Todo desde un sistema diseñado para empresas pesqueras.</p>

          <div style={h.ctas}>
            <button onClick={() => navigate("/empresa/login")} style={h.ctaPrimary}>Acceso empresa →</button>
          </div>

          <div style={h.divider}>
            <span style={h.dividerLine} />
            <span style={h.dividerText}>¿eres cliente y quieres comprar?</span>
            <span style={h.dividerLine} />
          </div>
          <button onClick={() => navigate("/tienda")} style={h.ctaTienda}>
            🛒 Ir a la tienda online →
          </button>

          <div style={h.trust}>
            <span style={h.trustDot} />
            <span style={h.trustText}>Tecnología diseñada para empresas pesqueras</span>
          </div>
        </motion.div>

        {/* Afiche derecha — ocupa exactamente la mitad de la sección */}
        <motion.div {...fadeUp(0.2)} style={{ flex: "0 0 50%", alignSelf: "stretch", overflow: "hidden", display: "flex", alignItems: "center" }}>
          <img
            src={afichePesquera}
            alt="Pesquera Estrada"
            style={{ width: "100%", display: "block" }}
          />
        </motion.div>
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

      {/* ── VIDEO PUBLICITARIO ── */}
      <SeccionVideo />

      {/* ── HISTORIA ── */}
      <section id="sec-historia" style={info.section}>
        <div style={info.inner}>
          <motion.div style={info.text} {...slideLeft(0)}>
            <div style={info.tag}>📖 Historia</div>
            <h2 style={info.title}>Fundada en 2020 para resolver una necesidad real</h2>
            <p style={info.desc}>
              Pesquera Estrada nació en Puerto Carreño, Vichada, barrio Calarcá, cuando el auge
              de la pesca saturó el mercado y los pescadores no tenían dónde vender sus capturas.
              En alianza inicial con Pesquera Rastrillo, adquirió el conocimiento clave del negocio
              para crecer de forma independiente.
            </p>
            <p style={info.desc}>
              Hoy almacena hasta <strong>4 toneladas semanales</strong> de diversas especies y
              distribuye a ciudades como Bogotá, Villavicencio y Medellín.
            </p>
          </motion.div>
          <motion.div style={info.imgWrap} {...slideRight(0.1)}>
            <img src={img1} alt="Fachada Pesquera Estrada, Puerto Carreño" style={info.img} />
            <div style={info.imgCaption}>Sede principal · Barrio Calarcá, Puerto Carreño</div>
          </motion.div>
        </div>
      </section>

      {/* ── UBICACIÓN ── */}
      <section id="sec-ubicacion" style={{ ...info.section, backgroundColor: "#f8fafc" }}>
        <motion.div style={{ textAlign: "center", marginBottom: "36px" }} {...fadeUp(0)}>
          <div style={info.tag}>📍 Ubicación</div>
          <h2 style={info.title}>Puerto Carreño, Vichada</h2>
          <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "560px", margin: "0 auto" }}>
            Estratégicamente ubicada sobre el río Orinoco, con acceso a rutas terrestres y aéreas
            hacia los principales mercados del país.
          </p>
        </motion.div>
        <div style={ub.grid}>
          <motion.div {...slideLeft(0)}><MapaInteractivo /></motion.div>
          <motion.div style={ub.info} {...slideRight(0)}>
            <h3 style={ub.infoTitle}>Rutas de distribución</h3>
            <div style={ub.cards}>
              {[
                { icon: "✈️", title: "Ruta aérea", desc: "Aerocarga Islas S.A.S — vuelos directos a Bogotá y Villavicencio", color: "#eff6ff", border: "#bfdbfe" },
                { icon: "🚛", title: "Ruta terrestre", desc: "Vehículos Thermo King — carretera hacia Bogotá y Medellín", color: "#f0fdf4", border: "#bbf7d0" },
                { icon: "🌊", title: "Ruta fluvial", desc: "Acceso directo al río Orinoco para capturas frescas", color: "#ecfeff", border: "#a5f3fc" },
              ].map((r, i) => (
                <div key={i} style={{ ...ub.card, backgroundColor: r.color, borderColor: r.border }}>
                  <span style={{ fontSize: "22px" }}>{r.icon}</span>
                  <div>
                    <div style={ub.cardTitle}>{r.title}</div>
                    <div style={ub.cardDesc}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={ub.truckWrap}>
              <img src={img9} alt="Camión Thermo King distribución" style={ub.truckImg} />
              <div style={ub.truckCaption}>Flota de distribución · Thermo King refrigerado</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PORTAFOLIO ── */}
      <section id="sec-portafolio" style={info.section}>
        <motion.div style={{ textAlign: "center", marginBottom: "48px" }} {...fadeUp(0)}>
          <div style={info.tag}>🐠 Portafolio de productos</div>
          <h2 style={info.title}>Especies frescas y congeladas del Vichada</h2>
          <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "520px", margin: "0 auto" }}>
            Todos los productos cumplen estrictos estándares de calidad y normativas sanitarias de la AUNAP.
          </p>
        </motion.div>
        <div style={port.grid}>
          {[
            { nombre: "Bagre grande / mediano", emoji: "🐟" },
            { nombre: "Dorado mediano / grande", emoji: "🐠" },
            { nombre: "Cachama", emoji: "🐡" },
            { nombre: "Tilapia & Mojarra", emoji: "🐟" },
            { nombre: "Cajaro & Valentón", emoji: "🐠" },
            { nombre: "Blanco & Amarillo", emoji: "🐡" },
            { nombre: "Bagre Tigre", emoji: "🐟" },
            { nombre: "Chancleto", emoji: "🐠" },
          ].map((esp, i) => (
            <motion.div key={i} style={port.card}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(54,116,181,0.12)" }}
            >
              <span style={{ fontSize: "28px" }}>{esp.emoji}</span>
              <span style={port.label}>{esp.nombre}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ACTIVIDAD ── */}
      <section id="sec-actividad" style={{ ...info.section, backgroundColor: "#f8fafc" }}>
        <motion.div style={{ textAlign: "center", marginBottom: "48px" }} {...fadeUp(0)}>
          <div style={info.tag}>⚙️ Instalaciones</div>
          <h2 style={info.title}>Infraestructura propia de procesamiento y frío</h2>
          <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "540px", margin: "0 auto" }}>
            Pesquera Estrada invierte el 70% de sus ganancias en ampliar y mantener su planta de almacenamiento.
          </p>
        </motion.div>
        <div style={act.grid}>
          <motion.div style={act.card} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
            <img src={img7} alt="Cuarto de procesamiento Pesquera Estrada" style={act.img} />
            <div style={act.cardBody}>
              <div style={act.cardTitle}>🏭 Cuarto de procesamiento</div>
              <p style={act.cardDesc}>Área sanitizada de recepción y preparación del producto, diseñada para cumplir las normativas del INVIMA y la AUNAP.</p>
            </div>
          </motion.div>
          <motion.div style={act.card} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
            <img src={img8} alt="Cuarto frío congeladores Pesquera Estrada" style={act.img} />
            <div style={act.cardBody}>
              <div style={act.cardTitle}>❄️ Cuarto frío · 5 toneladas</div>
              <p style={act.cardDesc}>5 unidades de refrigeración de 400 kg cada una más cuarto frío principal. Capacidad total: <strong>4 toneladas semanales</strong>.</p>
            </div>
          </motion.div>
        </div>
        <div style={act.stats}>
          {[
            { n: "5", label: "Congeladores de 400 kg" },
            { n: "4 ton", label: "Capacidad semanal" },
            { n: "70%", label: "Ganancias reinvertidas" },
            { n: "AUNAP", label: "Normativa cumplida" },
          ].map((s, i) => (
            <motion.div key={i} style={act.statItem} {...fadeIn(i * 0.1)}>
              <span style={act.statNum}>{s.n}</span>
              <span style={act.statLabel}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROCESO ADMINISTRATIVO ── */}
      <section id="sec-proceso" style={info.section}>
        <motion.div style={{ textAlign: "center", marginBottom: "48px" }} {...fadeUp(0)}>
          <div style={info.tag}>🏛️ Proceso administrativo</div>
          <h2 style={info.title}>Estructura organizativa de Pesquera Estrada</h2>
        </motion.div>
        <div style={proc.grid}>
          {[
            { icon: "👔", cargo: "Gerente General de Operaciones", nombre: "Próspero Martínez Estrada", desc: "Gestiona el ámbito operativo y financiero. Supervisa adquisición, comercialización y tratamiento del producto." },
            { icon: "🚚", cargo: "Gestión Logística", nombre: "Alba Ruth Martínez Estrada", desc: "Controla el flujo del producto, el transporte de mercancía y el cumplimiento de normativas de distribución." },
            { icon: "👷", cargo: "Personal operativo", nombre: "Contratación temporal", desc: "Personal flexible según necesidades de producción: limpieza, desinfección y organización en cámaras." },
          ].map((p, i) => (
            <motion.div key={i} style={proc.card}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            >
              <div style={proc.iconWrap}>{p.icon}</div>
              <div style={proc.cargo}>{p.cargo}</div>
              <div style={proc.nombre}>{p.nombre}</div>
              <p style={proc.desc}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INFOGRÁFICO ── */}
      <section style={{ padding: "72px 32px", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        <motion.div {...fadeUp(0)} style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: "999px", border: "1px solid rgba(96,165,250,0.3)", color: "#93c5fd", fontSize: "13px", fontWeight: "600", marginBottom: "12px", backgroundColor: "rgba(37,99,235,0.08)" }}>¿Por qué WareFish?</div>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "white", letterSpacing: "-0.02em" }}>Todo lo que tu empresa necesita en un solo lugar</h2>
        </motion.div>
        <motion.div {...fadeUp(0.15)} style={{ maxWidth: "960px", width: "100%" }}>
          <img src={aficheSistema} alt="Infográfico WareFish" style={{ width: "100%", borderRadius: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", display: "block" }} />
        </motion.div>
      </section>


      {/* ── CONTROL ── */}
      <section id="control" style={sy.section}>
        <div style={sy.inner}>
          <motion.div style={sy.text} {...slideLeft(0)}>
            <div style={f.badge}>Control total</div>
            <h2 style={sy.title}>Un panel para gobernarlos a todos</h2>
            <p style={sy.desc}>Visualiza ventas, gestiona inventario y toma decisiones en tiempo real. Sin hojas de cálculo, sin caos, sin pérdida de información.</p>
            <ul style={sy.list}>
              {["Stock actualizado automáticamente con cada venta", "Reportes exportables por período o categoría", "Multiusuario con roles diferenciados por empresa", "Historial completo de transacciones y clientes"].map((item, i) => (
                <li key={i} style={sy.listItem}><span style={sy.check}>✓</span>{item}</li>
              ))}
            </ul>
            <button onClick={() => navigate("/empresa/registro")} style={sy.cta}>Empezar ahora →</button>
          </motion.div>
          <motion.div style={sy.imgWrap} {...slideRight(0.1)}>
            <img src="https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&q=80" alt="Panel de control" style={sy.img} />
          </motion.div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="how" style={{ padding: "96px 32px", backgroundColor: "#f8fafc" }}>
        <motion.div style={f.header} {...fadeUp(0)}>
          <div style={{ ...f.badge, color: "#3674B5", borderColor: "#bfdbfe", backgroundColor: "#EEF4FF" }}>Proceso</div>
          <h2 style={f.title}>Listo en 3 pasos</h2>
          <p style={f.subtitle}>Configura tu empresa y empieza a operar en minutos.</p>
        </motion.div>
        <div style={hw.steps}>
          {steps.map((step, i) => (
            <motion.div key={i} style={hw.step}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
            >
              <div style={hw.stepNum}>{step.n}</div>
              <h3 style={hw.stepTitle}>{step.title}</h3>
              <p style={hw.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={ct.section}>
        <motion.div style={ct.inner} {...fadeUp(0)}>
          <h2 style={ct.title}>¿Listo para transformar tu empresa?</h2>
          <p style={ct.subtitle}>Únete a cientos de empresas que ya gestionan su negocio con FishWare.</p>
          <div style={ct.btns}>
            <button onClick={() => navigate("/empresa/login")} style={ct.btnPrimary}>Acceso empresa</button>
            <button onClick={() => navigate("/tienda")} style={ct.btnOutline}>🛒 Ir a la tienda</button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={fo.footer}>
        <div style={fo.inner}>
          <div style={fo.brand}>
            <img src={logoWarefish} alt="WareFish Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span style={fo.brandName}>WareFish</span>
          </div>
          <span style={fo.copy}>© 2026 WareFish · Plataforma empresarial</span>
        </div>
      </footer>
    </div>
  );
}

/* ─── ESTILOS MAPA ─── */
const mp = {
  wrap: { borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" },
  tabs: { display: "flex", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" },
  tab: { flex: 1, padding: "10px 8px", border: "none", background: "transparent", fontSize: "12px", fontWeight: "500", color: "#64748b", cursor: "pointer", transition: "all 0.2s", borderBottom: "2px solid transparent" },
  tabActive: { color: "#3674B5", borderBottomColor: "#3674B5", backgroundColor: "white", fontWeight: "700" },
  mapContainer: { position: "relative", height: "340px", backgroundColor: "#e2e8f0" },
  iframe: { width: "100%", height: "100%", border: "none" },
  mapOverlay: { position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "10px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  pin: { fontSize: "20px" },
  pinTitle: { fontSize: "13px", fontWeight: "700", color: "#0f172a" },
  pinSub: { fontSize: "11px", color: "#64748b" },
  imgMode: { width: "100%", height: "100%", position: "relative" },
  mapImg: { width: "100%", height: "340px", objectFit: "cover", display: "block" },
  imgCaption: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15,23,42,0.75)", color: "white", fontSize: "11px", padding: "8px 14px", textAlign: "center" },
  links: { display: "flex", gap: "8px", padding: "12px", backgroundColor: "#f8fafc" },
  linkBtn: { flex: 1, textAlign: "center", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#3674B5", fontSize: "12px", fontWeight: "600", textDecoration: "none" },
};

const ub = {
  grid: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" },
  info: {},
  infoTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" },
  cards: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" },
  card: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", border: "1px solid", fontSize: "13px" },
  cardTitle: { fontWeight: "700", color: "#0f172a", marginBottom: "2px" },
  cardDesc: { color: "#64748b", lineHeight: "1.5" },
  truckWrap: { borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
  truckImg: { width: "100%", height: "160px", objectFit: "cover", display: "block" },
  truckCaption: { backgroundColor: "#f8fafc", padding: "8px 14px", fontSize: "11px", color: "#64748b", textAlign: "center", borderTop: "1px solid #e2e8f0" },
};

const act = {
  grid: { maxWidth: "900px", margin: "0 auto 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  card: { backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  img: { width: "100%", height: "200px", objectFit: "cover", display: "block" },
  cardBody: { padding: "20px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" },
  cardDesc: { fontSize: "13px", color: "#64748b", lineHeight: "1.6" },
  stats: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px", gap: "4px", borderRight: "1px solid #e2e8f0" },
  statNum: { fontSize: "28px", fontWeight: "800", color: "#3674B5" },
  statLabel: { fontSize: "12px", color: "#64748b", textAlign: "center" },
};

const bc = {
  bar: { position: "sticky", top: "64px", zIndex: 99, backgroundColor: "#0d1f35", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  inner: { maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "38px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navLeft: { display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" },
  navRight: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  prefix: { fontSize: "11px", fontWeight: "700", color: "#94d4be", whiteSpace: "nowrap" },
  arrow: { fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "0 2px" },
  rowItem: { display: "flex", alignItems: "center", gap: "4px" },
  dot: { color: "rgba(255,255,255,0.15)", fontSize: "10px" },
  crumb: { fontSize: "11px", color: "rgba(255,255,255,0.38)", textDecoration: "none", padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap" },
  crumbDim: { fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" },
  crumbActive: { fontSize: "11px", fontWeight: "600", color: "#60a5fa", padding: "2px 7px", backgroundColor: "rgba(54,116,181,0.25)", borderRadius: "4px", whiteSpace: "nowrap" },
  crumbPage: { fontSize: "11px", fontWeight: "600", color: "#60a5fa", padding: "2px 7px", backgroundColor: "rgba(37,99,235,0.2)", borderRadius: "4px", whiteSpace: "nowrap" },
};

const info = {
  section: { padding: "80px 32px", backgroundColor: "white" },
  inner: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" },
  tag: { display: "inline-block", fontSize: "12px", fontWeight: "600", color: "#3674B5", backgroundColor: "#EEF4FF", padding: "3px 12px", borderRadius: "999px", marginBottom: "12px", letterSpacing: "0.03em" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "14px" },
  desc: { fontSize: "14px", color: "#64748b", lineHeight: "1.75", marginBottom: "12px" },
  imgWrap: {},
  img: { width: "100%", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", objectFit: "cover", maxHeight: "340px", display: "block" },
  imgCaption: { marginTop: "8px", fontSize: "11px", color: "#94a3b8", textAlign: "center" },
  text: {},
};

const port = {
  grid: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  card: { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "all 0.2s" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151", textAlign: "center", lineHeight: "1.4" },
};

const proc = {
  grid: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  card: { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "6px" },
  iconWrap: { fontSize: "28px", marginBottom: "6px" },
  cargo: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#3674B5" },
  nombre: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  desc: { fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginTop: "4px" },
};

/* ─── NAVBAR ─── */
const n = {
  nav: { position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  navInner: { maxWidth: "1200px", margin: "0 auto", padding: "6px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandName: { fontSize: "20px", fontWeight: "700", color: "white", letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "8px" },
  navLink: { color: "rgba(255,255,255,0.65)", fontSize: "14px", textDecoration: "none", padding: "6px 14px", borderRadius: "8px" },
  // ── NUEVO ──
  btnTienda: { padding: "8px 18px", backgroundColor: "#3674B5", border: "none", borderRadius: "8px", color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "600" },
  btnOutline: { padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "500" },
  btnPrimary: { padding: "8px 20px", backgroundColor: "#3674B5", border: "none", borderRadius: "8px", color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "600" },
};

/* ─── HERO ─── */
const h = {
  section: { minHeight: "600px", height: "75vh", background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 50%, #0f1f2e 100%)", display: "flex", alignItems: "stretch", padding: 0, position: "relative", overflow: "hidden" },
  glow1: { position: "absolute", top: "-200px", left: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)", pointerEvents: "none" },
  glow2: { position: "absolute", bottom: "-200px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)", pointerEvents: "none" },
  inner: { maxWidth: "1300px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "48px", alignItems: "center", position: "relative", zIndex: 1 },
  textCol: {},
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(37,99,235,0.4)", color: "#93c5fd", fontSize: "13px", fontWeight: "500", marginBottom: "20px", backgroundColor: "rgba(37,99,235,0.08)" },
  title: { fontSize: "52px", fontWeight: "800", color: "white", lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "20px" },
  titleAccent: { color: "#60a5fa" },
  subtitle: { fontSize: "17px", color: "rgba(255,255,255,0.65)", lineHeight: "1.7", marginBottom: "32px", maxWidth: "440px" },
  ctas: { display: "flex", gap: "12px", marginBottom: "16px" },
  ctaPrimary: { padding: "13px 28px", backgroundColor: "#3674B5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  ctaSecondary: { padding: "13px 28px", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", fontSize: "15px", cursor: "pointer" },
  // ── NUEVO ──
  divider: { display: "flex", alignItems: "center", gap: "10px", margin: "4px 0 12px" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.12)", display: "block" },
  dividerText: { fontSize: "11px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", letterSpacing: "0.05em" },
  ctaTienda: { padding: "11px 22px", backgroundColor: "transparent", color: "#34d399", border: "1px solid rgba(52,211,153,0.35)", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px", display: "inline-block" },
  trust: { display: "flex", alignItems: "center", gap: "8px" },
  trustDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#60a5fa", display: "inline-block" },
  trustText: { fontSize: "13px", color: "rgba(255,255,255,0.45)" },
  imgCol: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center" },
  imgFrame: { borderRadius: "16px", overflow: "visible", position: "relative", width: "75%" },
  img: { width: "100%", borderRadius: "16px", boxShadow: "0 40px 80px rgba(0,0,0,0.4)", display: "block" },
  floatBadge: { position: "absolute", bottom: "-18px", left: "-18px", backgroundColor: "white", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
  floatTitle: { fontSize: "11px", color: "#64748b", fontWeight: "500" },
  floatValue: { fontSize: "14px", fontWeight: "700", color: "#3674B5" },
};

const st = {
  section: { backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "32px" },
  inner: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" },
  item: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "16px", borderRight: "1px solid rgba(255,255,255,0.08)" },
  num: { fontSize: "32px", fontWeight: "800", color: "#60a5fa" },
  label: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
};

const f = {
  header: { textAlign: "center", marginBottom: "56px" },
  badge: { display: "inline-block", padding: "4px 14px", borderRadius: "999px", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "14px", backgroundColor: "white", letterSpacing: "0.04em", textTransform: "uppercase" },
  title: { fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "12px" },
  subtitle: { fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto" },
  grid: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", borderRadius: "16px", padding: "28px 24px", border: "1px solid #e2e8f0", transition: "all 0.2s" },
  iconWrap: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  cardDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const sy = {
  section: { padding: "96px 32px", backgroundColor: "white" },
  inner: { maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" },
  text: {},
  title: { fontSize: "36px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", letterSpacing: "-0.02em", marginTop: "12px", marginBottom: "16px" },
  desc: { fontSize: "15px", color: "#64748b", lineHeight: "1.7", marginBottom: "24px" },
  list: { listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#374151" },
  check: { width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#EEF4FF", color: "#3674B5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px" },
  cta: { padding: "12px 28px", backgroundColor: "#3674B5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  imgWrap: {},
  img: { width: "100%", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" },
};

const hw = {
  steps: { maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" },
  step: { backgroundColor: "white", borderRadius: "16px", padding: "32px 28px", border: "1px solid #e2e8f0" },
  stepNum: { fontSize: "36px", fontWeight: "900", color: "#eff6ff", WebkitTextStroke: "2px #3674B5", marginBottom: "16px", lineHeight: 1 },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const ct = {
  section: { background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "96px 32px" },
  inner: { textAlign: "center", maxWidth: "600px", margin: "0 auto" },
  title: { fontSize: "40px", fontWeight: "800", color: "white", marginBottom: "16px", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "16px", color: "rgba(255,255,255,0.72)", marginBottom: "36px", lineHeight: "1.6" },
  btns: { display: "flex", gap: "12px", justifyContent: "center" },
  btnPrimary: { padding: "14px 32px", backgroundColor: "white", color: "#3674B5", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  btnOutline: { padding: "14px 32px", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", fontSize: "15px", cursor: "pointer" },
};

const fo = {
  footer: { backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 32px" },
  inner: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand: { display: "flex", alignItems: "center", gap: "8px" },
  brandName: { fontSize: "15px", fontWeight: "700", color: "white" },
  copy: { fontSize: "13px", color: "rgba(255,255,255,0.4)" },
};

/* ─── VIDEO ─── */
const vid = {
  section: { backgroundColor: "#0a1628", padding: "80px 32px" },
  inner:   { maxWidth: "900px", margin: "0 auto", textAlign: "center" },
  tag:     { display: "inline-block", fontSize: "12px", fontWeight: "600", color: "#60a5fa", backgroundColor: "rgba(54,116,181,0.15)", border: "1px solid rgba(96,165,250,0.3)", padding: "3px 14px", borderRadius: "999px", marginBottom: "14px", letterSpacing: "0.04em" },
  title:   { fontSize: "34px", fontWeight: "800", color: "white", letterSpacing: "-0.02em", marginBottom: "10px" },
  subtitle:{ fontSize: "15px", color: "rgba(255,255,255,0.55)", marginBottom: "36px", lineHeight: "1.6" },

  // YouTube embed
  frameWrap: { position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: "18px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" },
  iframe:    { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" },

  // Video local
  playerWrap:  { position: "relative", borderRadius: "18px", overflow: "hidden", cursor: "pointer", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" },
  video:       { width: "100%", display: "block", maxHeight: "500px", objectFit: "cover" },
  playOverlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", transition: "background 0.2s" },
  playBtn:     { width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "rgba(54,116,181,0.9)", color: "white", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(54,116,181,0.5)", paddingLeft: "4px" },

  // Placeholder
  placeholder:     { border: "2px dashed rgba(255,255,255,0.12)", borderRadius: "18px", padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  placeholderIcon: { fontSize: "56px", opacity: 0.4 },
  placeholderText: { fontSize: "16px", fontWeight: "600", color: "rgba(255,255,255,0.5)", margin: 0 },
  placeholderSub:  { fontSize: "13px", color: "rgba(255,255,255,0.25)", margin: 0 },
};