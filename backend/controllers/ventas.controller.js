import pool from "../config/db.js";

// =========================
// CREAR VENTA
// =========================
export const crearVenta = async (req, res) => {
  const client = await pool.connect();

  try {
    const empresa_id = req.user.empresa_id;
    const administrador_id = req.user.id;

    const { cliente_id, metodo_pago_id, productos } = req.body;

    // ✅ Validación previa antes de abrir la transacción
    if (!cliente_id || !metodo_pago_id || !productos || productos.length === 0) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await client.query("BEGIN");

    const ventaResult = await client.query(
      `INSERT INTO ventas (empresa_id, administrador_id, cliente_id, metodo_pago_id, total)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [empresa_id, administrador_id, cliente_id, metodo_pago_id]
    );

    const venta = ventaResult.rows[0];

    let total = 0;

    for (const item of productos) {
      const { producto_id, cantidad } = item;

      // ✅ Validar kilos > 0 antes del INSERT para dar mensaje claro
      if (!cantidad || cantidad <= 0) {
        throw new Error("La cantidad de kilos debe ser mayor a 0");
      }

      const productoResult = await client.query(
        "SELECT * FROM productos WHERE id = $1 AND empresa_id = $2",
        [producto_id, empresa_id]
      );

      const producto = productoResult.rows[0];

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      const subtotal = producto.precio * cantidad;
      total += subtotal;

      await client.query(
        `INSERT INTO detalle_venta (venta_id, producto_id, kilos, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venta.id, producto_id, cantidad, producto.precio]
      );

      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [cantidad, producto_id]
      );
    }

    await client.query(
      "UPDATE ventas SET total = $1 WHERE id = $2",
      [total, venta.id]
    );

    await client.query("COMMIT");

    // ✅ Devolver info suficiente para el recibo en el frontend
    res.status(201).json({
      venta_id: venta.id,
      total,
      fecha: venta.fecha
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =========================
// LISTAR VENTAS EMPRESA
// =========================
export const listarVentasEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { hoy } = req.query;

    const filtroPOS    = hoy === "true" ? "AND DATE(v.fecha)        = CURRENT_DATE" : "";
    const filtroOnline = hoy === "true" ? "AND DATE(po.fecha_pedido) = CURRENT_DATE" : "";

    const result = await pool.query(
      `SELECT
         v.id          AS venta_id,
         v.fecha,
         v.total,
         pc.nombre || ' ' || pc.apellido AS cliente,
         mp.metodo     AS metodo_pago,
         'completada'  AS estado,
         'POS'         AS origen
       FROM ventas v
       JOIN persona     pc ON pc.id = v.cliente_id
       JOIN metodo_pago mp ON mp.id = v.metodo_pago_id
       WHERE v.empresa_id = $1 ${filtroPOS}

       UNION ALL

       SELECT
         po.id           AS venta_id,
         po.fecha_pedido AS fecha,
         po.total,
         pc.nombre || ' ' || pc.apellido AS cliente,
         mp.metodo       AS metodo_pago,
         po.estado,
         'Tienda online'  AS origen
       FROM pedidos_online po
       JOIN persona     pc ON pc.id = po.cliente_id
       LEFT JOIN metodo_pago mp ON mp.id = po.metodo_pago_id
       WHERE po.empresa_id = $1 AND po.estado != 'cancelado' ${filtroOnline}

       ORDER BY fecha DESC`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
 

// =========================
// DETALLE DE UNA VENTA
// =========================
export const detalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    // Cabecera de la venta
    const ventaResult = await pool.query(
      `SELECT 
         v.id AS venta_id,
         v.fecha,
         v.total,
         v.ruta_pdf,
         p_cliente.nombre || ' ' || p_cliente.apellido AS cliente,
         p_cliente.numero_documento,
         p_admin.nombre || ' ' || p_admin.apellido AS administrador,
         mp.metodo AS metodo_pago
       FROM ventas v
       JOIN persona p_cliente ON v.cliente_id = p_cliente.id
       JOIN persona p_admin   ON v.administrador_id = p_admin.id
       JOIN metodo_pago mp    ON v.metodo_pago_id = mp.id
       WHERE v.id = $1 AND v.empresa_id = $2`,
      [id, empresa_id]
    );

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // Productos del detalle
    const detalleResult = await pool.query(
      `SELECT 
         p.nombre AS producto,
         dv.kilos,
         dv.precio_unitario,
         dv.subtotal
       FROM detalle_venta dv
       JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = $1`,
      [id]
    );

    res.json({
      ...ventaResult.rows[0],
      detalle: detalleResult.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =========================
// HISTORIAL DE VENTAS POR CLIENTE
// =========================
export const historialCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT 
         v.id AS venta_id,
         v.fecha,
         v.total,
         mp.metodo AS metodo_pago,
         json_agg(json_build_object(
           'producto',        p.nombre,
           'kilos',           dv.kilos,
           'precio_unitario', dv.precio_unitario,
           'subtotal',        dv.subtotal
         )) AS detalle
       FROM ventas v
       JOIN metodo_pago mp    ON mp.id = v.metodo_pago_id
       JOIN detalle_venta dv  ON dv.venta_id = v.id
       JOIN productos p       ON p.id = dv.producto_id
       WHERE v.cliente_id = $1 AND v.empresa_id = $2
       GROUP BY v.id, v.fecha, v.total, mp.metodo
       ORDER BY v.fecha DESC`,
      [cliente_id, empresa_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =========================
// REPORTE PRODUCTOS MÁS VENDIDOS
// =========================
export const reporteProductos = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { desde, hasta } = req.query;
    const filtroPOS    = desde && hasta ? `AND v.fecha        BETWEEN '${desde}' AND '${hasta} 23:59:59'` : "";
    const filtroOnline = desde && hasta ? `AND po.fecha_pedido BETWEEN '${desde}' AND '${hasta} 23:59:59'` : "";

    const result = await pool.query(`
      SELECT
        pr.nombre,
        SUM(t.kilos)    AS total_vendido,
        SUM(t.ingresos) AS total_ingresos
      FROM (
        SELECT dv.producto_id, dv.kilos, dv.kilos * dv.precio_unitario AS ingresos
        FROM detalle_venta dv
        JOIN ventas v ON v.id = dv.venta_id
        WHERE v.empresa_id = $1 ${filtroPOS}
        UNION ALL
        SELECT dp.producto_id, dp.kilos, dp.kilos * dp.precio_unitario AS ingresos
        FROM detalle_pedido_online dp
        JOIN pedidos_online po ON po.id = dp.pedido_id
        WHERE po.empresa_id = $1 AND po.estado != 'cancelado' ${filtroOnline}
      ) t
      JOIN productos pr ON pr.id = t.producto_id
      GROUP BY pr.nombre
      ORDER BY total_vendido DESC
    `, [empresa_id]);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

