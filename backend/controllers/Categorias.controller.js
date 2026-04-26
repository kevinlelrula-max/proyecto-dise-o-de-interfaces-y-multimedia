import pool from "../config/db.js";

// =========================
// GET CATEGORÍAS
// =========================
export const getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, estado FROM categoria ORDER BY nombre ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

// =========================
// CREAR CATEGORÍA
// =========================
export const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO categoria (nombre, estado)
       VALUES ($1, true)
       RETURNING *`,
      [nombre.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

// =========================
// ACTUALIZAR NOMBRE
// =========================
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE categoria SET nombre = $1 WHERE id = $2 RETURNING *`,
      [nombre.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

// =========================
// TOGGLE ESTADO (activar/desactivar)
// =========================
export const toggleEstadoCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene productos activos antes de desactivar
    const productos = await pool.query(
      `SELECT COUNT(*) FROM productos WHERE categoria_id = $1`,
      [id]
    );

    const result = await pool.query(
      `UPDATE categoria
       SET estado = NOT estado
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({
      ...result.rows[0],
      productos_asociados: parseInt(productos.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// =========================
// ELIMINAR CATEGORÍA
// =========================
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // No eliminar si tiene productos asociados
    const productos = await pool.query(
      `SELECT COUNT(*) FROM productos WHERE categoria_id = $1`,
      [id]
    );

    if (parseInt(productos.rows[0].count) > 0) {
      return res.status(400).json({
        error: `No se puede eliminar — tiene ${productos.rows[0].count} producto(s) asociado(s). Desactívela en su lugar.`
      });
    }

    await pool.query(`DELETE FROM categoria WHERE id = $1`, [id]);
    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};