import pool from "../config/db.js";

export const getreporteEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // 🔹 KPIs
    const kpis = await pool.query(
      `SELECT 
        COUNT(*) AS ventas,
        COALESCE(SUM(total),0) AS ingresos,
        COALESCE(AVG(total),0) AS promedio
       FROM ventas
       WHERE empresa_id = $1`,
      [empresa_id]
    );

    // 🔹 Ventas por día
    const ventasPorDia = await pool.query(
      `SELECT 
        DATE(fecha) AS dia,
        SUM(total) AS total
       FROM ventas
       WHERE empresa_id = $1
       GROUP BY dia
       ORDER BY dia ASC`,
      [empresa_id]
    );

    // 🔹 Productos más vendidos
    const productos = await pool.query(
      `SELECT 
        p.nombre,
        SUM(dv.kilos) AS cantidad
       FROM detalle_venta dv
       JOIN productos p ON p.id = dv.producto_id
       JOIN ventas v ON v.id = dv.venta_id
       WHERE v.empresa_id = $1
       GROUP BY p.nombre
       ORDER BY cantidad DESC
       LIMIT 5`,
      [empresa_id]
    );

    // 🔹 Clientes activos
    const clientes = await pool.query(
      `SELECT 
        pe.nombre,
        COUNT(v.id) AS compras
       FROM ventas v
       JOIN persona pe ON pe.id = v.cliente_id
       WHERE v.empresa_id = $1
       GROUP BY pe.nombre
       ORDER BY compras DESC
       LIMIT 5`,
      [empresa_id]
    );

    res.json({
      kpis: kpis.rows[0],
      ventasPorDia: ventasPorDia.rows,
      productos: productos.rows,
      clientes: clientes.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};