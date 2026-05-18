import pool from "../config/db.js";

// =========================
// DASHBOARD HOME — KPIs del día
// =========================
export const getDashboard = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // ── KPIs de hoy: ventas POS + pedidos online (no cancelados) ────────────
    const kpisHoy = await pool.query(`
      SELECT
        COUNT(*)                AS ventas_hoy,
        COALESCE(SUM(total), 0) AS ingresos_hoy
      FROM (
        SELECT total FROM ventas
        WHERE empresa_id = $1 AND DATE(fecha) = CURRENT_DATE
        UNION ALL
        SELECT total FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado'
          AND DATE(fecha_pedido) = CURRENT_DATE
      ) t
    `, [empresa_id]);

    // ── Pedidos pendientes (tienda online) ───────────────────────────────────
    const pedidosPendientes = await pool.query(`
      SELECT COUNT(*) AS pendientes
      FROM pedidos_online
      WHERE empresa_id = $1 AND estado = 'pendiente'
    `, [empresa_id]);

    // ── Alertas de stock ─────────────────────────────────────────────────────
    const stockAlertas = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE stock = 0)               AS sin_stock,
        COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) AS stock_bajo
      FROM productos
      WHERE empresa_id = $1
    `, [empresa_id]);

    // ── Sparkline: últimos 7 días ────────────────────────────────────────────
    const spark = await pool.query(`
      SELECT DATE(fecha) AS dia, SUM(total) AS total
      FROM (
        SELECT total, fecha FROM ventas
        WHERE empresa_id = $1
          AND fecha >= CURRENT_DATE - INTERVAL '6 days'
        UNION ALL
        SELECT total, fecha_pedido AS fecha FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado'
          AND fecha_pedido >= CURRENT_DATE - INTERVAL '6 days'
      ) t
      GROUP BY dia
      ORDER BY dia ASC
    `, [empresa_id]);

    // ── Comparativa mes actual vs mes anterior ───────────────────────────────
    const comparativa = await pool.query(`
      SELECT
        COALESCE(SUM(CASE
          WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
          THEN total END), 0) AS mes_actual,
        COALESCE(SUM(CASE
          WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          THEN total END), 0) AS mes_anterior
      FROM (
        SELECT total, fecha FROM ventas WHERE empresa_id = $1
        UNION ALL
        SELECT total, fecha_pedido AS fecha FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado'
      ) t
    `, [empresa_id]);

    // ── Actividad reciente: últimos 5 pedidos online ─────────────────────────
    const recientes = await pool.query(`
      SELECT
        po.id,
        po.fecha_pedido AS fecha,
        po.total,
        po.estado,
        pe.nombre || ' ' || pe.apellido AS cliente
      FROM pedidos_online po
      JOIN persona pe ON pe.id = po.cliente_id
      WHERE po.empresa_id = $1
      ORDER BY po.fecha_pedido DESC
      LIMIT 5
    `, [empresa_id]);

    res.json({
      ventas_hoy:          Number(kpisHoy.rows[0].ventas_hoy),
      ingresos_hoy:        Number(kpisHoy.rows[0].ingresos_hoy),
      pedidos_pendientes:  Number(pedidosPendientes.rows[0].pendientes),
      sin_stock:           Number(stockAlertas.rows[0].sin_stock),
      stock_bajo:          Number(stockAlertas.rows[0].stock_bajo),
      spark:               spark.rows,
      recientes:           recientes.rows,
      mes_actual:          Number(comparativa.rows[0].mes_actual),
      mes_anterior:        Number(comparativa.rows[0].mes_anterior),
    });

  } catch (error) {
    console.error("Error dashboard:", error);
    res.status(500).json({ error: error.message });
  }
};
