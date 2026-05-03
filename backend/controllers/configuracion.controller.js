import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// =========================
// CONFIGURACIÓN DE MULTER (logo)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/logos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Un solo logo por empresa — sobreescribe el anterior
    cb(null, `logo_empresa_${req.user.empresa_id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
});

// =========================
// GET CONFIGURACIÓN COMPLETA
// Devuelve datos de empresa + métodos de pago activos
// =========================
export const getConfiguracion = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // Datos de la empresa
    const empresaResult = await pool.query(
      `SELECT id, nombre, nit, email, telefono, direccion, logo_url
       FROM empresas
       WHERE id = $1`,
      [empresa_id]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const empresa = empresaResult.rows[0];

    // Métodos de pago: todos los globales + estado por empresa
    // LEFT JOIN para que aparezcan todos aunque no tengan fila en pivot
    const metodosResult = await pool.query(
      `SELECT
         mp.id,
         mp.metodo                                       AS key,
         COALESCE(emp.activo, true)                      AS activo
       FROM metodo_pago mp
       LEFT JOIN empresa_metodo_pago emp
         ON emp.metodo_id = mp.id AND emp.empresa_id = $1
       ORDER BY mp.id`,
      [empresa_id]
    );

    res.json({
      nombre:      empresa.nombre    || "",
      nit:         empresa.nit       || "",
      email:       empresa.email     || "",
      telefono:    empresa.telefono  || "",
      direccion:   empresa.direccion || "",
      logoUrl:     empresa.logo_url  || null,
      metodosPago: metodosResult.rows,
    });
  } catch (error) {
    console.error("Error en getConfiguracion:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// =========================
// PUT DATOS DE EMPRESA
// Actualiza nombre, nit, email, teléfono, dirección
// =========================
export const updateDatosEmpresa = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { nombre, nit, email, telefono, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre de la empresa es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE empresas
       SET nombre    = $1,
           nit       = $2,
           email     = $3,
           telefono  = $4,
           direccion = $5
       WHERE id = $6
       RETURNING id, nombre, nit, email, telefono, direccion, logo_url`,
      [nombre, nit, email, telefono, direccion, empresa_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error en updateDatosEmpresa:", error);
    res.status(500).json({ error: "Error al actualizar datos de empresa" });
  }
};

// =========================
// PUT MÉTODOS DE PAGO
// Recibe array [{ key, activo }] y hace upsert en pivot
// =========================
export const updateMetodosPago = async (req, res) => {
  const client = await pool.connect();
  try {
    const empresa_id = req.user.empresa_id;
    const { metodos } = req.body;

    if (!Array.isArray(metodos) || metodos.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de métodos" });
    }

    await client.query("BEGIN");

    for (const { key, activo } of metodos) {
      // Buscar el id del método por su nombre
      const mp = await client.query(
        "SELECT id FROM metodo_pago WHERE metodo = $1",
        [key]
      );

      if (mp.rows.length === 0) continue; // método desconocido, ignorar

      const metodo_id = mp.rows[0].id;

      // Upsert en la tabla pivot
      await client.query(
        `INSERT INTO empresa_metodo_pago (empresa_id, metodo_id, activo)
         VALUES ($1, $2, $3)
         ON CONFLICT (empresa_id, metodo_id)
         DO UPDATE SET activo = EXCLUDED.activo`,
        [empresa_id, metodo_id, activo]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Métodos de pago actualizados correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en updateMetodosPago:", error);
    res.status(500).json({ error: "Error al actualizar métodos de pago" });
  } finally {
    client.release();
  }
};

// =========================
// POST LOGO
// Sube o reemplaza el logo de la empresa
// =========================
export const subirLogo = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const logo_url = `/uploads/logos/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE empresas
       SET logo_url = $1
       WHERE id = $2
       RETURNING logo_url`,
      [logo_url, empresa_id]
    );

    res.json({ logoUrl: result.rows[0].logo_url });
  } catch (error) {
    console.error("Error en subirLogo:", error);
    res.status(500).json({ error: "Error al subir el logo" });
  }
};
