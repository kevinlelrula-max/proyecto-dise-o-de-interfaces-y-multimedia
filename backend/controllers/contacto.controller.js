import pool from "../config/db.js";

export const enviarMensaje = async (req, res) => {
  try {
    const { empresa_id, nombre, apellido, email, asunto, mensaje } = req.body;

    if (!empresa_id || !nombre || !mensaje) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nombreCompleto = apellido ? `${nombre} ${apellido}` : nombre;
    const mensajeCompleto = asunto ? `[${asunto}] ${mensaje}` : mensaje;

    await pool.query(
      `INSERT INTO mensajes_contacto (empresa_id, nombre, email, mensaje)
       VALUES ($1, $2, $3, $4)`,
      [empresa_id, nombreCompleto, email || null, mensajeCompleto]
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error al guardar mensaje:", error);
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
};

export const getMensajes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT id, nombre, email, mensaje, leido, fecha
       FROM mensajes_contacto
       WHERE empresa_id = $1
       ORDER BY fecha DESC`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

export const marcarLeido = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { id } = req.params;

    await pool.query(
      `UPDATE mensajes_contacto SET leido = true
       WHERE id = $1 AND empresa_id = $2`,
      [id, empresa_id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al marcar mensaje:", error);
    res.status(500).json({ error: "Error al actualizar el mensaje" });
  }
};
