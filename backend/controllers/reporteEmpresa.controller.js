import pool from "../config/db.js";

export const getreporteEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // Período opcional
    const { desde, hasta } = req.query;
    const filtroPOS     = desde && hasta ? `AND fecha        BETWEEN '${desde}' AND '${hasta} 23:59:59'` : "";
    const filtroOnline  = desde && hasta ? `AND fecha_pedido BETWEEN '${desde}' AND '${hasta} 23:59:59'` : "";

    // ── KPIs: POS + tienda online (excluye cancelados) ───────────────────────
    const kpis = await pool.query(`
      SELECT
        COUNT(*)                    AS ventas,
        COALESCE(SUM(total), 0)     AS ingresos,
        COALESCE(AVG(total), 0)     AS promedio
      FROM (
        SELECT total FROM ventas
        WHERE empresa_id = $1 ${filtroPOS}
        UNION ALL
        SELECT total FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado' ${filtroOnline}
      ) t
    `, [empresa_id]);

    // ── Ventas por día: POS + tienda online ───────────────────────────────────
    const ventasPorDia = await pool.query(`
      SELECT DATE(fecha) AS dia, SUM(total) AS total
      FROM (
        SELECT total, fecha FROM ventas
        WHERE empresa_id = $1 ${filtroPOS}
        UNION ALL
        SELECT total, fecha_pedido AS fecha FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado' ${filtroOnline}
      ) t
      GROUP BY dia
      ORDER BY dia ASC
    `, [empresa_id]);

    // ── Productos más vendidos: detalle POS + detalle online ──────────────────
    const productos = await pool.query(`
      SELECT pr.nombre, SUM(t.kilos) AS cantidad
      FROM (
        SELECT dv.producto_id, dv.kilos FROM detalle_venta dv
        JOIN ventas v ON v.id = dv.venta_id
        WHERE v.empresa_id = $1 ${filtroPOS}
        UNION ALL
        SELECT dp.producto_id, dp.kilos FROM detalle_pedido_online dp
        JOIN pedidos_online po ON po.id = dp.pedido_id
        WHERE po.empresa_id = $1 AND po.estado != 'cancelado' ${filtroOnline}
      ) t
      JOIN productos pr ON pr.id = t.producto_id
      GROUP BY pr.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `, [empresa_id]);

    // ── Clientes más activos: POS + tienda online ─────────────────────────────
    const clientes = await pool.query(`
      SELECT pe.nombre, COUNT(*) AS compras
      FROM (
        SELECT cliente_id FROM ventas
        WHERE empresa_id = $1 ${filtroPOS}
        UNION ALL
        SELECT cliente_id FROM pedidos_online
        WHERE empresa_id = $1 AND estado != 'cancelado' ${filtroOnline}
      ) t
      JOIN persona pe ON pe.id = t.cliente_id
      GROUP BY pe.nombre
      ORDER BY compras DESC
      LIMIT 5
    `, [empresa_id]);

    res.json({
      kpis:         kpis.rows[0],
      ventasPorDia: ventasPorDia.rows,
      productos:    productos.rows,
      clientes:     clientes.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
