import { useState, useEffect } from "react";
import { crearRol } from "../services/usuarios.api";

const ROLES_FIJOS = [1, 2, 3, 4];

const TODAS_LAS_SECCIONES = [
  { key: "productos",     label: "Productos",       icon: "📦" },
  { key: "clientes",      label: "Clientes",        icon: "👥" },
  { key: "ventas",        label: "Ventas",          icon: "💰" },
  { key: "reportes",      label: "Reportes",        icon: "📊" },
  { key: "usuarios",      label: "Usuarios",        icon: "🧑‍💼" },
  { key: "pos",           label: "Punto de venta",  icon: "🛒" },
  { key: "configuracion", label: "Configuración",   icon: "⚙️" },
];

const COLORES = [
  { color: "#dc2626", bg: "#fef2f2" },
  { color: "#1d4ed8", bg: "#eff6ff" },
  { color: "#0F6E56", bg: "#E1F5EE" },
  { color: "#7c3aed", bg: "#f5f3ff" },
  { color: "#b45309", bg: "#fffbeb" },
  { color: "#0891b2", bg: "#ecfeff" },
];

// Descripción de permisos por defecto para roles fijos (se muestra antes de editar)
const PERMISOS_DESCRIPCION = {
  1: ["Acceso total al sistema", "Gestión de todas las empresas", "Crear y eliminar roles"],
  2: ["Gestión completa de la empresa", "Productos, clientes, ventas, reportes", "Gestión de usuarios y configuración"],
  3: ["Punto de venta", "Gestión de clientes"],
  4: ["Vista de catálogo", "Historial de sus compras"],
};

/**
 * Determina si `rolUsuario` puede editar los permisos de `rolId`
 *
 * Reglas:
 *  - Nadie edita el rol 1 (SuperAdmin) — evita bloqueo total
 *  - SuperAdmin (1) puede editar 2, 3, 4 y personalizados
 *  - Admin (2) puede editar 3, 4 y personalizados, pero NO el 2 (el suyo)
 */
function puedeEditar(rolUsuario, rolId) {
  if (rolId === 1) return false;                        // SuperAdmin nunca editable
  if (rolUsuario === 1) return true;                    // SuperAdmin edita todo lo demás
  if (rolUsuario === 2 && rolId !== 2) return true;     // Admin edita todo menos sí mismo
  return false;
}

export default function GestionRoles() {
  const token      = localStorage.getItem("token");
  const rolUsuario = Number(JSON.parse(atob(token.split(".")[1]))?.rol_id);

  const [roles, setRoles]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [nuevoRol, setNuevoRol]   = useState("");
  const [guardando, setGuardando] = useState(false);

  const [rolEditando, setRolEditando]             = useState(null);
  const [permisosEditando, setPermisosEditando]   = useState([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  // ── Cargar roles ──────────────────────────────────────────────────────────
  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/usuarios/roles/todos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Crear rol ─────────────────────────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return;
    setGuardando(true);
    try {
      const creado = await crearRol({ nombre: nuevoRol }, token);
      setRoles([...roles, creado]);
      setNuevoRol("");
    } catch (error) {
      alert(error.response?.data?.error || "Error al crear rol");
    } finally {
      setGuardando(false);
    }
  };

  // ── Abrir / cerrar editor de permisos ────────────────────────────────────
  const abrirEditor = async (rol) => {
    if (rolEditando?.id === rol.id) {
      setRolEditando(null);
      return;
    }
    setRolEditando(rol);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/usuarios/roles/${rol.id}/permisos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPermisosEditando(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPermisosEditando([]);
    }
  };

  // ── Toggle sección ────────────────────────────────────────────────────────
  const togglePermiso = (seccion) => {
    setPermisosEditando(prev =>
      prev.includes(seccion)
        ? prev.filter(s => s !== seccion)
        : [...prev, seccion]
    );
  };

  // ── Guardar permisos ──────────────────────────────────────────────────────
  const guardarPermisos = async () => {
    setGuardandoPermisos(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/usuarios/roles/${rolEditando.id}/permisos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ secciones: permisosEditando })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al guardar");
        return;
      }

      alert(`Permisos de "${rolEditando.nombre}" actualizados ✅`);
      setRolEditando(null);
    } catch (e) {
      alert("Error al guardar permisos");
    } finally {
      setGuardandoPermisos(false);
    }
  };

  return (
    <div style={s.wrap}>

      {/* Info */}
      <div style={s.infoBox}>
        <span style={{ fontSize: 18 }}>🔑</span>
        <div>
          <div style={s.infoTitle}>Gestión de roles y permisos</div>
          <div style={s.infoText}>
            El rol <strong>SuperAdmin</strong> no puede modificarse. Los demás roles base y personalizados pueden configurarse según las necesidades de tu empresa.
          </div>
        </div>
      </div>

      {/* Formulario nuevo rol */}
      {(rolUsuario === 1 || rolUsuario === 2) && (
        <div style={s.nuevaCard}>
          <h3 style={s.cardTitle}>➕ Nuevo rol personalizado</h3>
          <form style={s.form} onSubmit={handleCrear}>
            <input
              style={s.input}
              placeholder="Ej: Supervisor, Bodeguero, Contador..."
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value)}
            />
            <button style={s.btnCrear} type="submit" disabled={guardando || !nuevoRol.trim()}>
              {guardando ? "Guardando..." : "Crear rol"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de roles */}
      <div style={s.listaCard}>
        <h3 style={s.cardTitle}>Roles del sistema</h3>

        {cargando ? (
          <div style={s.spinner}>Cargando roles...</div>
        ) : (
          roles.map((rol, i) => {
            const color    = COLORES[i % COLORES.length];
            const esFijo   = ROLES_FIJOS.includes(rol.id);
            const permisos = PERMISOS_DESCRIPCION[rol.id];
            const editando = rolEditando?.id === rol.id;
            const editable = puedeEditar(rolUsuario, rol.id);

            // Etiqueta del tipo de rol
            const etiqueta = rol.id === 1
              ? { label: "SuperAdmin — protegido", style: s.rolSuperBadge }
              : esFijo
                ? { label: "Rol base", style: s.rolFijoBadge }
                : { label: "Personalizado", style: s.rolPersonalizado };

            return (
              <div key={rol.id} style={s.rolItem}>
                <div style={{ ...s.rolBadge, background: color.bg, color: color.color }}>
                  {rol.nombre.charAt(0)}
                </div>

                <div style={s.rolInfo}>
                  <div style={s.rolHeader}>
                    <span style={s.rolNombre}>{rol.nombre}</span>
                    <span style={etiqueta.style}>{etiqueta.label}</span>

                    {/* Botón editar: visible según jerarquía */}
                    {editable && (
                      <button
                        style={{ ...s.btnEditar, ...(editando ? s.btnEditarActivo : {}) }}
                        onClick={() => abrirEditor(rol)}
                      >
                        {editando ? "✕ Cerrar" : "✏️ Editar permisos"}
                      </button>
                    )}
                  </div>

                  {/* Descripción estática para roles fijos (cuando no se edita) */}
                  {permisos && !editando && (
                    <div style={s.permisosList}>
                      {permisos.map((p, j) => (
                        <span key={j} style={s.permisoItem}>✓ {p}</span>
                      ))}
                    </div>
                  )}

                  {/* Mensaje roles personalizados sin editor abierto */}
                  {!permisos && !editando && (
                    <div style={s.permisosList}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {editable
                          ? 'Haz clic en "Editar permisos" para configurar el acceso de este rol'
                          : "Sin permisos configurados"}
                      </span>
                    </div>
                  )}

                  {/* Editor de permisos con checkboxes */}
                  {editando && (
                    <div style={s.editorPermisos}>
                      <div style={s.editorTitle}>Selecciona las secciones a las que tendrá acceso:</div>
                      <div style={s.checkGrid}>
                        {TODAS_LAS_SECCIONES.map(sec => (
                          <label key={sec.key} style={s.checkLabel}>
                            <input
                              type="checkbox"
                              checked={permisosEditando.includes(sec.key)}
                              onChange={() => togglePermiso(sec.key)}
                              style={s.checkbox}
                            />
                            <span style={s.checkIcon}>{sec.icon}</span>
                            <span style={s.checkText}>{sec.label}</span>
                          </label>
                        ))}
                      </div>
                      <div style={s.editorFooter}>
                        <span style={s.editorHint}>
                          {permisosEditando.length} sección{permisosEditando.length !== 1 ? "es" : ""} seleccionada{permisosEditando.length !== 1 ? "s" : ""}
                        </span>
                        <button
                          style={s.btnGuardarPermisos}
                          onClick={guardarPermisos}
                          disabled={guardandoPermisos}
                        >
                          {guardandoPermisos ? "Guardando..." : "Guardar permisos"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" },

  infoBox: {
    display: "flex", gap: "12px", alignItems: "flex-start",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "12px", padding: "14px 16px",
  },
  infoTitle: { fontSize: "13px", fontWeight: "600", color: "#1d4ed8", marginBottom: "3px" },
  infoText:  { fontSize: "12px", color: "#3b82f6", lineHeight: 1.5 },

  nuevaCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "18px",
  },
  cardTitle: { fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: "0 0 12px" },
  form:  { display: "flex", gap: "10px" },
  input: {
    flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0",
    borderRadius: "9px", fontSize: "13px", outline: "none", color: "#0f172a",
  },
  btnCrear: {
    padding: "9px 20px", background: "linear-gradient(135deg, #00C9A7, #0099FF)",
    border: "none", borderRadius: "9px", color: "#fff",
    fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },

  listaCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "18px",
  },
  rolItem: {
    display: "flex", alignItems: "flex-start", gap: "12px",
    padding: "14px 0", borderBottom: "1px solid #f1f5f9",
  },
  rolBadge: {
    width: "38px", height: "38px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "700", flexShrink: 0, marginTop: "2px",
  },
  rolInfo:   { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  rolHeader: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  rolNombre: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },

  rolSuperBadge: {
    fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
    background: "#fef9c3", color: "#854d0e", fontWeight: "500",
  },
  rolFijoBadge: {
    fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
    background: "#f1f5f9", color: "#64748b", fontWeight: "500",
  },
  rolPersonalizado: {
    fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
    background: "#f0fdf4", color: "#16a34a", fontWeight: "500",
  },

  btnEditar: {
    padding: "4px 10px", fontSize: "11px", fontWeight: "500",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    background: "#f8fafc", color: "#64748b", cursor: "pointer",
    marginLeft: "auto", transition: "all 0.12s",
  },
  btnEditarActivo: {
    background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626",
  },

  permisosList: { display: "flex", flexDirection: "column", gap: "3px" },
  permisoItem:  { fontSize: "12px", color: "#0F6E56" },

  editorPermisos: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: "10px", padding: "14px",
  },
  editorTitle: { fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "12px" },
  checkGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "8px", marginBottom: "14px",
  },
  checkLabel: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 10px", borderRadius: "8px",
    background: "#fff", border: "1px solid #e2e8f0",
    cursor: "pointer", fontSize: "13px", transition: "all 0.12s",
  },
  checkbox:  { width: "15px", height: "15px", accentColor: "#00C9A7", cursor: "pointer" },
  checkIcon: { fontSize: "14px" },
  checkText: { color: "#0f172a", fontSize: "13px" },

  editorFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  editorHint:   { fontSize: "12px", color: "#94a3b8" },
  btnGuardarPermisos: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #00C9A7, #0099FF)",
    border: "none", borderRadius: "8px",
    color: "#fff", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", transition: "opacity 0.15s",
  },

  spinner: { padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
};