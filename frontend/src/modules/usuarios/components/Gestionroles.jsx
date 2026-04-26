import { useState, useEffect } from "react";
import { getRoles, crearRol } from "../services/usuarios.api";

const ROLES_FIJOS = [1, 2, 3, 4]; // No se pueden eliminar los roles base

export default function GestionRoles() {
  const token = localStorage.getItem("token");
  const rolUsuario = JSON.parse(atob(token.split(".")[1]))?.rol_id;

  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoRol, setNuevoRol] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      // Traer todos los roles incluyendo SuperAdmin
      const res = await fetch("http://localhost:3000/api/usuarios/roles", {
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

  const COLORES = [
    { color: "#dc2626", bg: "#fef2f2" },
    { color: "#1d4ed8", bg: "#eff6ff" },
    { color: "#0F6E56", bg: "#E1F5EE" },
    { color: "#7c3aed", bg: "#f5f3ff" },
    { color: "#b45309", bg: "#fffbeb" },
    { color: "#0891b2", bg: "#ecfeff" },
  ];

  return (
    <div style={s.wrap}>

      {/* Info */}
      <div style={s.infoBox}>
        <span style={{ fontSize: 18 }}>🔑</span>
        <div>
          <div style={s.infoTitle}>Gestión de roles</div>
          <div style={s.infoText}>
            Los roles definen qué puede hacer cada usuario en el sistema.
            Los roles base (SuperAdmin, Administrador, Empleado, Cliente) no se pueden eliminar.
          </div>
        </div>
      </div>

      {/* Formulario nuevo rol — solo SuperAdmin */}
      {rolUsuario === 1 && (
        <div style={s.nuevaCard}>
          <h3 style={s.cardTitle}>➕ Nuevo rol</h3>
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
            const color = COLORES[i % COLORES.length];
            const esFijo = ROLES_FIJOS.includes(rol.id);
            return (
              <div key={rol.id} style={s.rolItem}>
                <div style={{ ...s.rolBadge, background: color.bg, color: color.color }}>
                  {rol.nombre.charAt(0)}
                </div>
                <div style={s.rolInfo}>
                  <span style={s.rolNombre}>{rol.nombre}</span>
                  {esFijo && <span style={s.rolFijo}>Rol base del sistema</span>}
                </div>
                {!esFijo && (
                  <span style={s.rolPersonalizado}>Personalizado</span>
                )}
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
  infoText: { fontSize: "12px", color: "#3b82f6", lineHeight: 1.5 },

  nuevaCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "18px",
  },
  cardTitle: { fontSize: "14px", fontWeight: "600", color: "#0f172a", marginBottom: "12px", margin: "0 0 12px" },
  form: { display: "flex", gap: "10px" },
  input: {
    flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0",
    borderRadius: "9px", fontSize: "13px", outline: "none", color: "#0f172a",
  },
  btnCrear: {
    padding: "9px 20px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none", borderRadius: "9px", color: "#fff",
    fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },

  listaCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "18px",
  },
  rolItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "11px 0", borderBottom: "1px solid #f1f5f9",
  },
  rolBadge: {
    width: "36px", height: "36px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", flexShrink: 0,
  },
  rolInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  rolNombre: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  rolFijo: { fontSize: "11px", color: "#94a3b8" },
  rolPersonalizado: {
    fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
    background: "#f0fdf4", color: "#16a34a", fontWeight: "500",
  },
  spinner: { padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
};