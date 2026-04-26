const ROLES = {
  1: { label: "SuperAdmin",    color: "#dc2626", bg: "#fef2f2" },
  2: { label: "Administrador", color: "#1d4ed8", bg: "#eff6ff" },
  3: { label: "Empleado",      color: "#0F6E56", bg: "#E1F5EE" },
  4: { label: "Cliente",       color: "#7c3aed", bg: "#f5f3ff" },
};

export default function TablaUsuarios({ usuarios, onEditar, onToggle, onEliminar }) {
  if (usuarios.length === 0) {
    return (
      <div style={s.empty}>
        <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>🧑‍💼</span>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Usuario</th>
            <th style={s.th}>Nombre de usuario</th>
            <th style={s.th}>Rol</th>
            <th style={{ ...s.th, textAlign: "center" }}>Estado</th>
            <th style={{ ...s.th, textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const rol = ROLES[u.rol_id] || { label: u.rol_nombre || `Rol ${u.rol_id}`, color: "#64748b", bg: "#f1f5f9" };
            const activo = u.activo !== false; // si no tiene campo activo, asume activo
            return (
              <tr key={u.id} style={{ ...s.row, opacity: activo ? 1 : 0.55 }}>

                {/* Avatar + nombre */}
                <td style={s.td}>
                  <div style={s.userWrap}>
                    <div style={{ ...s.avatar, backgroundColor: rol.bg, color: rol.color }}>
                      {u.nombre?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={s.nombre}>{u.nombre} {u.apellido}</div>
                      <div style={s.telefono}>{u.telefono || "—"}</div>
                    </div>
                  </div>
                </td>

                {/* Usuario */}
                <td style={s.td}>
                  <span style={s.correo}>{u.usuario}</span>
                </td>

                {/* Rol */}
                <td style={s.td}>
                  <span style={{ ...s.rolBadge, backgroundColor: rol.bg, color: rol.color }}>
                    {rol.label}
                  </span>
                </td>

                {/* Estado */}
                <td style={{ ...s.td, textAlign: "center" }}>
                  <span style={{ ...s.estadoBadge, ...(activo ? s.activo : s.inactivo) }}>
                    {activo ? "● Activo" : "● Inactivo"}
                  </span>
                </td>

                {/* Acciones */}
                <td style={{ ...s.td, textAlign: "center" }}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => onEditar(u)} title="Editar">✏️</button>
                    <button
                      style={{ ...s.btnToggle, ...(activo ? s.btnDesactivar : s.btnActivar) }}
                      onClick={() => onToggle(u.id)}
                      title={activo ? "Desactivar" : "Activar"}
                    >
                      {activo ? "⏸" : "▶"}
                    </button>
                    <button style={s.btnDelete} onClick={() => onEliminar(u.id)} title="Eliminar">🗑️</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrapper: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  row: { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },

  userWrap: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    fontSize: "14px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  nombre: { fontWeight: "600", color: "#0f172a", fontSize: "13px" },
  telefono: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  correo: { fontSize: "13px", color: "#64748b" },

  rolBadge: {
    display: "inline-block", padding: "4px 12px",
    borderRadius: "999px", fontSize: "12px", fontWeight: "600",
  },

  estadoBadge: {
    display: "inline-block", fontSize: "12px", fontWeight: "600", padding: "3px 10px",
    borderRadius: "999px",
  },
  activo: { color: "#0F6E56", background: "#E1F5EE" },
  inactivo: { color: "#94a3b8", background: "#f1f5f9" },

  actions: { display: "flex", gap: "6px", justifyContent: "center" },
  btnEdit: {
    padding: "5px 8px", background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "7px", cursor: "pointer", fontSize: "13px",
  },
  btnToggle: {
    padding: "5px 8px", border: "1px solid",
    borderRadius: "7px", cursor: "pointer", fontSize: "13px",
  },
  btnDesactivar: { background: "#fff7ed", borderColor: "#fed7aa", color: "#c2410c" },
  btnActivar: { background: "#E1F5EE", borderColor: "#6ee7b7", color: "#0F6E56" },
  btnDelete: {
    padding: "5px 8px", background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "7px", cursor: "pointer", fontSize: "13px",
  },

  empty: { textAlign: "center", padding: "48px 20px" },
};