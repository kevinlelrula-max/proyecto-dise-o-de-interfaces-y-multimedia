import pool from "../config/db.js";

export const crearPedido = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      empresa_id,
      cliente_id,
      metodo_pago_id,
      direccion_entrega,
      notas,
      total,
      items,
      stripe_payment_intent_id
    } = req.body;

    // 🔥 VALIDACIÓN REAL (ESTO EVITA "pedido inválido")
    if (
      !empresa_id ||
      !cliente_id ||
      !metodo_pago_id ||
      !direccion_entrega ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "pedido inválido",
        detalle: "faltan campos obligatorios"
      });
    }

    await client.query("BEGIN");

    // Si el pago ya fue confirmado por Stripe, el pedido arranca en "en preparacion"
    const estadoInicial = stripe_payment_intent_id ? "en preparacion" : "pendiente";

    // 🔥 1. CREAR PEDIDO
    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos_online (
        empresa_id,
        cliente_id,
        metodo_pago_id,
        direccion_entrega,
        notas,
        total,
        estado
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id
      `,
      [
        empresa_id,
        cliente_id,
        metodo_pago_id,
        direccion_entrega,
        notas || "",
        total,
        estadoInicial
      ]
    );

    const pedidoId = pedidoResult.rows[0].id;

    // 🔥 2. INSERTAR DETALLE
    for (const item of items) {
      await client.query(
        `
        INSERT INTO detalle_pedido_online (
          pedido_id,
          producto_id,
          kilos,
          precio_unitario
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
          pedidoId,
          item.producto_id,
          item.kilos,
          item.precio_unitario
        ]
      );

      // 🔥 3. (OPCIONAL) DESCONTAR STOCK
      await client.query(
        `
        UPDATE productos
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.kilos, item.producto_id]
      );
    }

    await client.query("COMMIT");

    return res.json({
      ok: true,
      pedido_id: pedidoId
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ ERROR PEDIDO:", error);

    return res.status(500).json({
      error: "Error creando pedido",
      detalle: error.message
    });

  } finally {
    client.release();
  }
};

// Reemplaza getMisPedidos en tu pedidos.controller.js

export const getMisPedidos = async (req, res) => {
  try {
    const cliente_id = req.user.id;

    // 1. Traer pedidos del cliente
    const pedidosResult = await pool.query(
      `SELECT 
         p.id,
         p.estado,
         p.total,
         p.direccion_entrega,
         p.notas,
         p.fecha_pedido,
         p.fecha_actualizacion,
         mp.metodo AS metodo_pago
       FROM pedidos_online p
       LEFT JOIN metodo_pago mp ON mp.id = p.metodo_pago_id
       WHERE p.cliente_id = $1
       ORDER BY p.fecha_pedido DESC`,
      [cliente_id]
    );

    const pedidos = pedidosResult.rows;

    if (pedidos.length === 0) return res.json([]);

    // 2. Traer detalle de todos los pedidos de una vez
    const ids = pedidos.map((p) => p.id);
    const detalleResult = await pool.query(
      `SELECT
         d.pedido_id,
         d.kilos,
         d.precio_unitario,
         d.subtotal,
         pr.nombre AS producto
       FROM detalle_pedido_online d
       JOIN productos pr ON pr.id = d.producto_id
       WHERE d.pedido_id = ANY($1)`,
      [ids]
    );

    // 3. Agrupar detalle por pedido_id
    const detalleMap = {};
    for (const row of detalleResult.rows) {
      if (!detalleMap[row.pedido_id]) detalleMap[row.pedido_id] = [];
      detalleMap[row.pedido_id].push(row);
    }

    // 4. Combinar
    const resultado = pedidos.map((p) => ({
      ...p,
      detalle: detalleMap[p.id] || [],
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error getMisPedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

export const getEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT estado FROM pedidos_online WHERE id = $1`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado" });
  }
};

export const getPedidosEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const pedidosResult = await pool.query(
      `SELECT
         p.id,
         p.estado,
         p.total,
         p.direccion_entrega,
         p.notas,
         p.fecha_pedido,
         p.fecha_actualizacion,
         mp.metodo AS metodo_pago,
         pe.nombre   AS cliente_nombre,
         pe.apellido AS cliente_apellido,
         pe.usuario  AS cliente_usuario
       FROM pedidos_online p
       LEFT JOIN metodo_pago mp ON mp.id = p.metodo_pago_id
       LEFT JOIN persona pe     ON pe.id = p.cliente_id
       WHERE p.empresa_id = $1
       ORDER BY p.fecha_pedido DESC`,
      [empresa_id]
    );

    const pedidos = pedidosResult.rows;
    if (pedidos.length === 0) return res.json([]);

    const ids = pedidos.map((p) => p.id);
    const detalleResult = await pool.query(
      `SELECT
         d.pedido_id,
         d.kilos,
         d.precio_unitario,
         pr.nombre AS producto
       FROM detalle_pedido_online d
       JOIN productos pr ON pr.id = d.producto_id
       WHERE d.pedido_id = ANY($1)`,
      [ids]
    );

    const detalleMap = {};
    for (const row of detalleResult.rows) {
      if (!detalleMap[row.pedido_id]) detalleMap[row.pedido_id] = [];
      detalleMap[row.pedido_id].push(row);
    }

    const resultado = pedidos.map((p) => ({
      ...p,
      detalle: detalleMap[p.id] || [],
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error getPedidosEmpresa:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const empresa_id = req.user.empresa_id;

    const estados = ["pendiente", "en preparacion", "enviado", "entregado", "cancelado"];
    if (!estados.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    const result = await pool.query(
      `UPDATE pedidos_online
       SET estado = $1, fecha_actualizacion = NOW()
       WHERE id = $2 AND empresa_id = $3
       RETURNING id, estado`,
      [estado, id, empresa_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizarEstadoPedido:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
};