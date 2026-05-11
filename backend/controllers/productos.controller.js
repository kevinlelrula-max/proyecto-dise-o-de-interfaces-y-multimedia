import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// =========================
// CONFIGURACIÓN DE MULTER
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/productos";
    // Crear carpeta si no existe
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = `producto_${Date.now()}${ext}`;
    cb(null, nombre);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB máximo
});

// =========================
// GET PRODUCTOS
// =========================
export const getProductos = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    const result = await pool.query(
      "SELECT * FROM productos WHERE empresa_id = $1",
      [empresa_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// =========================
// CREAR PRODUCTO
// =========================
export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, stock, categoria_id, precio_costo } = req.body;
    const empresa_id = req.user.empresa_id;

    const imagen_url = req.file
      ? `/uploads/productos/${req.file.filename}`
      : null;

    const result = await pool.query(
      `INSERT INTO productos (nombre, precio, stock, categoria_id, empresa_id, imagen_url, precio_costo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, precio, stock, categoria_id, empresa_id, imagen_url, precio_costo || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// =========================
// ACTUALIZAR PRODUCTO
// =========================
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock, categoria_id, precio_costo } = req.body;
    const empresa_id = req.user.empresa_id;

    let params;
    let query;

    if (req.file) {
      params = [nombre, precio, stock, categoria_id, precio_costo || null, `/uploads/productos/${req.file.filename}`, id, empresa_id];
      query = `UPDATE productos
               SET nombre=$1, precio=$2, stock=$3, categoria_id=$4, precio_costo=$5, imagen_url=$6
               WHERE id=$7 AND empresa_id=$8
               RETURNING *`;
    } else {
      params = [nombre, precio, stock, categoria_id, precio_costo || null, id, empresa_id];
      query = `UPDATE productos
               SET nombre=$1, precio=$2, stock=$3, categoria_id=$4, precio_costo=$5
               WHERE id=$6 AND empresa_id=$7
               RETURNING *`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// =========================
// ELIMINAR PRODUCTO
// =========================
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    // Obtener imagen antes de eliminar para borrar el archivo
    const prod = await pool.query(
      "SELECT imagen_url FROM productos WHERE id = $1 AND empresa_id = $2",
      [id, empresa_id]
    );

    if (prod.rows[0]?.imagen_url) {
      const filePath = `.${prod.rows[0].imagen_url}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query(
      "DELETE FROM productos WHERE id = $1 AND empresa_id = $2",
      [id, empresa_id]
    );

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

export const getProductosPorEmpresaPublico = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM productos WHERE empresa_id = $1",
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error productos públicos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};