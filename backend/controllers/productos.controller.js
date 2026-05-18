import pool from "../config/db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// =========================
// CONFIGURACIÓN CLOUDINARY
// =========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube un buffer a Cloudinary y devuelve la URL segura
function subirACloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "fishware/productos", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// =========================
// CONFIGURACIÓN DE MULTER
// =========================
// memoryStorage: guarda el archivo en RAM temporalmente
// el buffer se envía a Cloudinary y luego se descarta
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB máximo
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

    let imagen_url = null;
    if (req.file) {
      imagen_url = await subirACloudinary(req.file.buffer, req.file.mimetype);
    }

    const result = await pool.query(
      `INSERT INTO productos (nombre, precio, stock, categoria_id, empresa_id, imagen_url, precio_costo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, precio, stock, categoria_id, empresa_id, imagen_url, precio_costo || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
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
      const imagen_url = await subirACloudinary(req.file.buffer, req.file.mimetype);
      params = [nombre, precio, stock, categoria_id, precio_costo || null, imagen_url, id, empresa_id];
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
    console.error("Error al actualizar producto:", error);
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

    // Con Cloudinary las imágenes se gestionan desde su dashboard
    // No es necesario borrar archivos locales

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