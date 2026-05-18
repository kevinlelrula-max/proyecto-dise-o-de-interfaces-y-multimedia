import pool from "../config/db.js";

export const getNotificaciones = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const items = [];

    // ── 1. Mensajes de contacto sin leer ──────────────────────────────────────
    const mensajes = await pool.query(
      `SELECT id, nombre, fecha
       FROM mensajes_contacto
       WHERE empresa_id = $1 AND leido = false
       ORDER BY fecha DESC
       LIMIT 10`,
      [empresa_id]
    );
    mensajes.rows.forEach(m => {
      items.push({
        tipo: "mensaje",
        titulo: `Nuevo mensaje de ${m.nombre}`,
        descripcion: "Formulario de contacto · Sin leer",
        id: m.id,
        fecha: m.fecha,
        prioridad: 1,
      });
    });

    // ── 2. Pedidos online pendientes ───────────────────────────────────────────
    const pedidosPendientes = await pool.query(
      `SELECT p.id, pe.nombre AS cliente, p.fecha_pedido
       FROM pedidos_online p
       JOIN persona pe ON pe.id = p.cliente_id
       WHERE p.empresa_id = $1 AND p.estado = 'pendiente'
       ORDER BY p.fecha_pedido DESC
       LIMIT 10`,
      [empresa_id]
    );
    pedidosPendientes.rows.forEach(p => {
      items.push({
        tipo: "pedido",
        titulo: `Pedido #${p.id} sin atender`,
        descripcion: `Cliente: ${p.cliente}`,
        id: p.id,
        fecha: p.fecha_pedido,
        prioridad: 1,
      });
    });

    // ── 3. Pedidos en preparación por más de 24 h (atascados) ─────────────────
    const pedidosAtascados = await pool.query(
      `SELECT p.id, pe.nombre AS cliente, p.fecha_actualizacion
       FROM pedidos_online p
       JOIN persona pe ON pe.id = p.cliente_id
       WHERE p.empresa_id = $1
         AND p.estado = 'en preparacion'
         AND p.fecha_actualizacion < NOW() - INTERVAL '24 hours'
       ORDER BY p.fecha_actualizacion ASC
       LIMIT 10`,
      [empresa_id]
    );
    pedidosAtascados.rows.forEach(p => {
      items.push({
        tipo: "pedido_lento",
        titulo: `Pedido #${p.id} lleva +24 h en preparación`,
        descripcion: `Cliente: ${p.cliente} · Revisa el estado`,
        id: p.id,
        fecha: p.fecha_actualizacion,
        prioridad: 2,
      });
    });

    // ── 4. Pedidos cancelados en las últimas 24 h ──────────────────────────────
    const pedidosCancelados = await pool.query(
      `SELECT p.id, pe.nombre AS cliente, p.fecha_actualizacion
       FROM pedidos_online p
       JOIN persona pe ON pe.id = p.cliente_id
       WHERE p.empresa_id = $1
         AND p.estado = 'cancelado'
         AND p.fecha_actualizacion >= NOW() - INTERVAL '24 hours'
       ORDER BY p.fecha_actualizacion DESC
       LIMIT 5`,
      [empresa_id]
    );
    pedidosCancelados.rows.forEach(p => {
      items.push({
        tipo: "cancelado",
        titulo: `Pedido #${p.id} fue cancelado`,
        descripcion: `Cliente: ${p.cliente}`,
        id: p.id,
        fecha: p.fecha_actualizacion,
        prioridad: 2,
      });
    });

    // ── 5. Productos sin stock (stock = 0) ────────────────────────────────────
    const sinStock = await pool.query(
      `SELECT id, nombre
       FROM productos
       WHERE empresa_id = $1 AND stock = 0
       ORDER BY nombre ASC
       LIMIT 10`,
      [empresa_id]
    );
    sinStock.rows.forEach(p => {
      items.push({
        tipo: "sin_stock",
        titulo: `Sin stock: ${p.nombre}`,
        descripcion: "Producto agotado · Requiere reabastecimiento urgente",
        id: p.id,
        fecha: null,
        prioridad: 1,
      });
    });

    // ── 6. Productos con stock bajo (1 – 5) ───────────────────────────────────
    const stockBajo = await pool.query(
      `SELECT id, nombre, stock
       FROM productos
       WHERE empresa_id = $1 AND stock > 0 AND stock <= 5
       ORDER BY stock ASC
       LIMIT 10`,
      [empresa_id]
    );
    stockBajo.rows.forEach(p => {
      items.push({
        tipo: "stock",
        titulo: `Stock bajo: ${p.nombre}`,
        descripcion: `Solo quedan ${p.stock} kg disponibles`,
        id: p.id,
        fecha: null,
        prioridad: 3,
      });
    });

    // ── Ordenar: prioridad 1 > 2 > 3, luego por fecha desc ───────────────────
    items.sort((a, b) => {
      if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
      if (!a.fecha && !b.fecha) return 0;
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha) - new Date(a.fecha);
    });

    res.json({ total: items.length, items });
  } catch (error) {
    console.error("Error notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};
