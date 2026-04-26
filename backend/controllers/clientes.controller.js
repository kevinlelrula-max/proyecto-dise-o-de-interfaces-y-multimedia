import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";
// Clientes

export const getClientes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion, numero_documento
       FROM persona 
       WHERE empresa_id = $1 AND rol_id = 4`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// ✅ Nueva — búsqueda en tiempo real para el POS
export const buscarClientes = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { q } = req.query;

    const result = await pool.query(
      `SELECT id, nombre, apellido, numero_documento, telefono
       FROM persona
       WHERE empresa_id = $1 AND rol_id = 4
         AND (nombre ILIKE $2 OR apellido ILIKE $2 OR numero_documento ILIKE $2)
       ORDER BY nombre
       LIMIT 10`,
      [empresa_id, `%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const {
      nombre,
      apellido,
      usuario,
      contrasena,
      telefono,
      direccion,
      numero_documento,
      tipo_documento,   // ← agregar
      id_municipio      // ← agregar
    } = req.body;

    const tieneAcceso = usuario && contrasena;

    const usuarioFinal = tieneAcceso
      ? usuario
      : (numero_documento || `cliente_${Date.now()}`);

    const contrasenaFinal = tieneAcceso
      ? await bcrypt.hash(contrasena, 10)
      : await bcrypt.hash(`sin_acceso_${Date.now()}`, 10);

    const result = await pool.query(
      `INSERT INTO persona 
      (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, 
       numero_documento, tipo_documento, id_municipio, rol_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,4)
      RETURNING id, nombre, apellido, usuario, numero_documento`,
      [
        empresa_id,
        nombre,
        apellido,
        usuarioFinal,
        contrasenaFinal,
        telefono       || null,
        direccion      || null,
        numero_documento || null,
        tipo_documento || 'Cédula de ciudadanía',
        id_municipio   ? Number(id_municipio) : null  // ← castear a número
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    const { nombre, apellido, telefono, direccion } = req.body;

    const result = await pool.query(
      `UPDATE persona
       SET nombre=$1, apellido=$2, telefono=$3, direccion=$4
       WHERE id=$5 AND empresa_id=$6 AND rol_id=4
       RETURNING *`,
      [nombre, apellido, telefono, direccion, id, empresa_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

// ✅ Eliminación segura — verifica primero si tiene ventas asociadas
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    // Verificar si tiene ventas antes de eliminar
    const ventas = await pool.query(
      `SELECT COUNT(*) FROM ventas WHERE cliente_id = $1 AND empresa_id = $2`,
      [id, empresa_id]
    );

    if (parseInt(ventas.rows[0].count) > 0) {
      return res.status(400).json({
        error: "No se puede eliminar un cliente con ventas registradas"
      });
    }

    await pool.query(
      `DELETE FROM persona 
       WHERE id = $1 AND empresa_id = $2 AND rol_id = 4`,
      [id, empresa_id]
    );

    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};