import pool from "../config/db.js";
import bcrypt from "bcrypt";

// =========================
// GET USUARIOS (excluye clientes)
// =========================
export const getUsuarios = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      `SELECT p.id, p.nombre, p.apellido, p.usuario, p.telefono, p.direccion,
              p.numero_documento, p.rol_id, p.id_municipio, p.fecha_registro,
              p.activo,
              r.nombre AS rol_nombre
       FROM persona p
       JOIN roles r ON r.id = p.rol_id
       WHERE p.empresa_id = $1 AND p.rol_id != 4
       ORDER BY p.fecha_registro DESC`,
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// =========================
// CREAR USUARIO
// =========================
export const crearUsuario = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    if (req.user.rol_id !== 1 && req.user.rol_id !== 2) {
      return res.status(403).json({ error: "No tienes permisos para crear usuarios" });
    }

    const {
      nombre, apellido, usuario, contrasena,
      telefono, direccion, numero_documento, rol_id, id_municipio
    } = req.body;

    if (!nombre || !usuario || !contrasena || !rol_id) {
      return res.status(400).json({ error: "Nombre, usuario, contraseña y rol son obligatorios" });
    }

    // No permitir crear SuperAdmin desde el panel
    if (Number(rol_id) === 1) {
      return res.status(403).json({ error: "No se puede crear un SuperAdmin desde el panel" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO persona 
      (empresa_id, nombre, apellido, usuario, contrasena, telefono, direccion, numero_documento, rol_id, id_municipio)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, nombre, apellido, usuario, telefono, rol_id, fecha_registro`,
      [empresa_id, nombre, apellido, usuario, hashedPassword,
       telefono, direccion, numero_documento, rol_id, id_municipio || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "El nombre de usuario ya existe" });
    }
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// =========================
// ACTUALIZAR USUARIO
// =========================
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;
    const { nombre, apellido, telefono, direccion, rol_id } = req.body;

    if (Number(rol_id) === 1) {
      return res.status(403).json({ error: "No se puede asignar el rol SuperAdmin" });
    }

    const result = await pool.query(
      `UPDATE persona
       SET nombre=$1, apellido=$2, telefono=$3, direccion=$4, rol_id=$5
       WHERE id=$6 AND empresa_id=$7 AND rol_id != 4
       RETURNING id, nombre, apellido, usuario, telefono, rol_id`,
      [nombre, apellido, telefono, direccion, rol_id, id, empresa_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// =========================
// TOGGLE ACTIVO/INACTIVO
// =========================
export const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    // No desactivar al propio usuario logueado
    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: "No puedes desactivarte a ti mismo" });
    }

    const result = await pool.query(
      `UPDATE persona
       SET activo = NOT activo
       WHERE id = $1 AND empresa_id = $2 AND rol_id != 4
       RETURNING id, nombre, activo`,
      [id, empresa_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
};

// =========================
// ELIMINAR USUARIO
// =========================
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
    }

    // Verificar si tiene ventas registradas
    const ventas = await pool.query(
      `SELECT COUNT(*) FROM ventas WHERE administrador_id = $1`, [id]
    );

    if (parseInt(ventas.rows[0].count) > 0) {
      return res.status(400).json({
        error: "No se puede eliminar — el usuario tiene ventas registradas. Desactívalo en su lugar."
      });
    }

    await pool.query(
      `DELETE FROM persona WHERE id = $1 AND empresa_id = $2 AND rol_id != 4`,
      [id, empresa_id]
    );

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// =========================
// GET ROLES (para el selector)
// =========================
export const getRoles = async (req, res) => {
  try {
    // Excluir SuperAdmin(1) y Cliente(4) del selector
    const result = await pool.query(
      `SELECT id, nombre FROM roles WHERE id NOT IN (1, 4) ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

// =========================
// CREAR ROL
// =========================
export const crearRol = async (req, res) => {
  try {
    if (req.user.rol_id !== 1) {
      return res.status(403).json({ error: "Solo el SuperAdmin puede crear roles" });
    }

    const { nombre } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre del rol es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO roles (nombre) VALUES ($1) RETURNING *`,
      [nombre.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya existe un rol con ese nombre" });
    }
    res.status(500).json({ error: "Error al crear rol" });
  }
};

// =========================
// GET PERFIL
// =========================
export const getPerfil = async (req, res) => {
  try {
    const id = req.user.id;
    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, telefono, direccion FROM persona WHERE id = $1`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// =========================
// ACTUALIZAR PERFIL
// =========================
export const actualizarPerfil = async (req, res) => {
  try {
    const id = req.user.id;
    const { nombre, apellido, telefono, direccion } = req.body;

    const result = await pool.query(
      `UPDATE persona 
       SET nombre=$1, apellido=$2, telefono=$3, direccion=$4
       WHERE id=$5
       RETURNING *`,
      [nombre, apellido, telefono, direccion, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};