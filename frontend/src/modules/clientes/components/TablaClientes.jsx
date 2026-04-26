export default function TablaClientes({ clientes, onEditar, onEliminar }) {
  if (clientes.length === 0) {
    return (
      <div style={s.empty}>
        <span style={s.emptyIcon}>👥</span>
        <p style={s.emptyText}>No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Cliente</th>
            <th style={s.th}>Usuario</th>
            <th style={s.th}>Teléfono</th>
            <th style={{ ...s.th, textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} style={s.row}>
              <td style={s.td}>
                <div style={s.clienteInfo}>
                  <div style={s.avatar}>
                    {c.nombre?.charAt(0).toUpperCase()}{c.apellido?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={s.nombre}>{c.nombre} {c.apellido}</div>
                  </div>
                </div>
              </td>
              <td style={s.td}>
                <span style={s.usuario}>{c.usuario}</span>
              </td>
              <td style={s.td}>
                <span style={s.telefono}>{c.telefono || "—"}</span>
              </td>
              <td style={{ ...s.td, textAlign: "center" }}>
                <div style={s.actions}>
                  <button style={s.editBtn} onClick={() => onEditar(c)}>
                    ✏️ Editar
                  </button>
                  <button style={s.deleteBtn} onClick={() => onEliminar(c.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrapper: {
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  row: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },

  clienteInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    backgroundColor: "#eff6ff", color: "#2563eb",
    fontSize: "12px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  nombre: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },

  usuario: { fontSize: "13px", color: "#64748b" },
  telefono: { fontSize: "13px", color: "#64748b" },

  actions: { display: "flex", gap: "6px", justifyContent: "center" },
  editBtn: {
    padding: "6px 12px", fontSize: "12px", fontWeight: "600",
    border: "1.5px solid #2563eb", borderRadius: "8px",
    backgroundColor: "transparent", color: "#2563eb", cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px", fontSize: "12px", fontWeight: "600",
    border: "1.5px solid #ef4444", borderRadius: "8px",
    backgroundColor: "transparent", color: "#dc2626", cursor: "pointer",
  },

  empty: { textAlign: "center", padding: "48px 20px", color: "#94a3b8" },
  emptyIcon: { fontSize: "36px", display: "block", marginBottom: "10px" },
  emptyText: { fontSize: "14px" },
};
