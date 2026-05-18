import { useState, useRef } from "react";

const DISPLAY = 380;
const OUTPUT  = 512;

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function Slider({ icon, label, value, min, max, step = 1, onChange, display }) {
  return (
    <div style={s.group}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={s.groupLabel}>{icon} {label}</span>
        <span style={s.groupValue}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#0ea5e9", cursor: "pointer" }}
      />
    </div>
  );
}

export default function LogoEditor({ imageSrc, onConfirm, onCancel }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast,   setContrast]   = useState(100);
  const [zoom,       setZoom]       = useState(1);
  const [rotation,   setRotation]   = useState(0);
  const [bg,         setBg]         = useState("#ffffff");
  const [crop, setCrop] = useState({ x: 40, y: 40, w: 300, h: 300 });

  const dragRef = useRef(null);

  /* ── interacción drag ── */
  const onMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type, sx: e.clientX, sy: e.clientY, sc: { ...crop } };

    const move = (ev) => {
      if (!dragRef.current) return;
      const { type, sx, sy, sc } = dragRef.current;
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      const MIN = 60;

      setCrop(() => {
        let { x, y, w, h } = sc;
        if (type === "move") {
          x = clamp(sc.x + dx, 0, DISPLAY - sc.w);
          y = clamp(sc.y + dy, 0, DISPLAY - sc.h);
        } else if (type === "se") {
          w = clamp(sc.w + dx, MIN, DISPLAY - sc.x);
          h = clamp(sc.h + dy, MIN, DISPLAY - sc.y);
        } else if (type === "sw") {
          const nw = clamp(sc.w - dx, MIN, sc.x + sc.w);
          x = sc.x + sc.w - nw; w = nw;
          h = clamp(sc.h + dy, MIN, DISPLAY - sc.y);
        } else if (type === "ne") {
          w = clamp(sc.w + dx, MIN, DISPLAY - sc.x);
          const nh = clamp(sc.h - dy, MIN, sc.y + sc.h);
          y = sc.y + sc.h - nh; h = nh;
        } else if (type === "nw") {
          const nw = clamp(sc.w - dx, MIN, sc.x + sc.w);
          x = sc.x + sc.w - nw; w = nw;
          const nh = clamp(sc.h - dy, MIN, sc.y + sc.h);
          y = sc.y + sc.h - nh; h = nh;
        }
        return { x, y, w, h };
      });
    };

    const up = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  /* ── exportar a canvas ── */
  const handleConfirm = () => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Calcular cómo se muestra la imagen (object-fit: contain)
      const ratio = img.naturalWidth / img.naturalHeight;
      let dw, dh;
      if (ratio > 1) { dw = DISPLAY; dh = DISPLAY / ratio; }
      else           { dh = DISPLAY; dw = DISPLAY * ratio; }
      const dl = (DISPLAY - dw) / 2;
      const dt = (DISPLAY - dh) / 2;

      // Convertir coordenadas del recorte a píxeles de la imagen original
      const scaleX = img.naturalWidth  / dw;
      const scaleY = img.naturalHeight / dh;
      const cx = clamp((crop.x - dl) * scaleX, 0, img.naturalWidth);
      const cy = clamp((crop.y - dt) * scaleY, 0, img.naturalHeight);
      const cw = clamp(crop.w * scaleX, 1, img.naturalWidth  - cx);
      const ch = clamp(crop.h * scaleY, 1, img.naturalHeight - cy);

      const canvas = document.createElement("canvas");
      canvas.width  = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");

      // Fondo
      if (bg === "transparent") {
        ctx.clearRect(0, 0, OUTPUT, OUTPUT);
      } else {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, OUTPUT, OUTPUT);
      }

      // Filtros
      ctx.filter = `brightness(${brightness / 100}) contrast(${contrast / 100})`;

      // Transformaciones + dibujo
      ctx.save();
      ctx.translate(OUTPUT / 2, OUTPUT / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, cx, cy, cw, ch, -OUTPUT / 2, -OUTPUT / 2, OUTPUT, OUTPUT);
      ctx.restore();

      canvas.toBlob((blob) => {
        const file = new File([blob], "logo_empresa.png", { type: "image/png" });
        onConfirm(file);
      }, "image/png");
    };
  };

  const imgStyle = {
    width: "100%", height: "100%",
    objectFit: "contain",
    display: "block",
    position: "absolute", inset: 0,
    filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
    transform: `rotate(${rotation}deg) scale(${zoom})`,
    transformOrigin: "center",
    pointerEvents: "none",
    userSelect: "none",
  };

  const bgDisplay =
    bg === "transparent"
      ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0/16px 16px"
      : bg;

  const corners = [
    { key: "nw", top: -5,         left: -5,        cursor: "nw-resize" },
    { key: "ne", top: -5,         right: -5,       cursor: "ne-resize" },
    { key: "sw", bottom: -5,      left: -5,        cursor: "sw-resize" },
    { key: "se", bottom: -5,      right: -5,       cursor: "se-resize" },
  ];

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <h3 style={s.title}>✂️ Editor de logo</h3>
          <button onClick={onCancel} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.body}>

          {/* Imagen + recorte */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: DISPLAY, height: DISPLAY, position: "relative", overflow: "hidden", borderRadius: 10, border: "1px solid #e2e8f0", background: bgDisplay }}>

              <img src={imageSrc} alt="" style={imgStyle} draggable={false} />

              {/* Zonas oscuras fuera del recorte */}
              <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: crop.y, background: "rgba(0,0,0,0.55)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: DISPLAY - crop.y - crop.h, background: "rgba(0,0,0,0.55)" }} />
                <div style={{ position: "absolute", top: crop.y, left: 0, width: crop.x, height: crop.h, background: "rgba(0,0,0,0.55)" }} />
                <div style={{ position: "absolute", top: crop.y, right: 0, width: DISPLAY - crop.x - crop.w, height: crop.h, background: "rgba(0,0,0,0.55)" }} />
              </div>

              {/* Caja de recorte */}
              <div
                style={{ position: "absolute", top: crop.y, left: crop.x, width: crop.w, height: crop.h, zIndex: 3, border: "2px solid white", cursor: "move", boxSizing: "border-box", boxShadow: "0 0 0 1px rgba(0,0,0,0.4)" }}
                onMouseDown={(e) => onMouseDown(e, "move")}
              >
                {/* Guías de tercios */}
                {[1/3, 2/3].map((p) => (
                  <div key={"h" + p} style={{ position: "absolute", left: 0, right: 0, top: `${p * 100}%`, height: 1, background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                ))}
                {[1/3, 2/3].map((p) => (
                  <div key={"v" + p} style={{ position: "absolute", top: 0, bottom: 0, left: `${p * 100}%`, width: 1, background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                ))}

                {/* Handles de esquina */}
                {corners.map(({ key, cursor, ...pos }) => (
                  <div
                    key={key}
                    style={{ position: "absolute", width: 12, height: 12, backgroundColor: "white", border: "2px solid #0ea5e9", borderRadius: 2, cursor, ...pos }}
                    onMouseDown={(e) => onMouseDown(e, key)}
                  />
                ))}
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
              Arrastra para mover · Esquinas para redimensionar
            </p>
          </div>

          {/* Controles */}
          <div style={s.controls}>

            <Slider icon="☀️" label="Brillo"    value={brightness} min={0}   max={200}        onChange={setBrightness} display={`${brightness}%`} />
            <Slider icon="◑"  label="Contraste" value={contrast}   min={0}   max={200}        onChange={setContrast}   display={`${contrast}%`} />
            <Slider icon="🔍" label="Zoom"      value={zoom}       min={0.5} max={3} step={0.05} onChange={setZoom}    display={`${Math.round(zoom * 100)}%`} />

            {/* Rotación */}
            <div style={s.group}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={s.groupLabel}>🔄 Rotación</span>
                <span style={s.groupValue}>{rotation}°</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[-90, -45, -15, 15, 45, 90].map((d) => (
                  <button key={d} style={s.rotBtn} onClick={() => setRotation((r) => r + d)}>
                    {d > 0 ? "+" : ""}{d}°
                  </button>
                ))}
              </div>
              <button style={{ ...s.rotBtn, marginTop: 4, alignSelf: "flex-start" }} onClick={() => setRotation(0)}>
                Reset
              </button>
            </div>

            {/* Fondo */}
            <div style={s.group}>
              <span style={s.groupLabel}>🎨 Fondo</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Blanco",      val: "#ffffff" },
                  { label: "Negro",       val: "#000000" },
                  { label: "Sin fondo",   val: "transparent" },
                ].map((o) => (
                  <button
                    key={o.val}
                    style={{ ...s.bgBtn, ...(bg === o.val ? s.bgActive : {}) }}
                    onClick={() => setBg(o.val)}
                  >
                    <span style={{
                      width: 12, height: 12, borderRadius: "50%", display: "inline-block", flexShrink: 0,
                      background: o.val === "transparent"
                        ? "repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 0 0/8px 8px"
                        : o.val,
                      border: "1px solid #cbd5e1",
                    }} />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div style={{ marginTop: "auto", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={s.cancelBtn} onClick={onCancel}>Cancelar</button>
              <button style={s.confirmBtn} onClick={handleConfirm}>✓ Guardar logo</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal:      { background: "white", borderRadius: 16, width: "min(840px, 96vw)", maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" },
  title:      { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 },
  closeBtn:   { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 4 },
  body:       { display: "flex", gap: 28, padding: 24, flexWrap: "wrap" },
  controls:   { flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 20 },
  group:      { display: "flex", flexDirection: "column", gap: 7 },
  groupLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  groupValue: { fontSize: 12, color: "#6b7280" },
  rotBtn:     { padding: "4px 10px", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: "white", color: "#374151", transition: "all 0.15s" },
  bgBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "white", color: "#374151", transition: "all 0.15s" },
  bgActive:   { background: "#f0f9ff", borderColor: "#0ea5e9", color: "#0369a1", fontWeight: 600 },
  cancelBtn:  { padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "white", color: "#374151", fontSize: 14 },
  confirmBtn: { padding: "10px 24px", background: "#3674B5", border: "none", borderRadius: 8, cursor: "pointer", color: "white", fontSize: 14, fontWeight: 600 },
};
