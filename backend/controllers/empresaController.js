import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";

export const registrarEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre,
      nit,
      email,
      telefono,

      admin_nombre: nombre_admin,
      admin_apellido: apellido_admin,
      admin_usuario: usuario,
      admin_contrasena: contrasena,
      admin_telefono: telefono_admin,
      admin_direccion: direccion,
      admin_tipo_documento: tipo_documento,
      admin_numero_documento: numero_documento,
      admin_id_municipio: id_municipio
    } = req.body;

    // 🛑 VALIDACIONES BÁSICAS
    if (!nombre || !usuario || !contrasena) {
      return res.status(400).json({
        error: "Nombre empresa, usuario y contraseña son obligatorios"
      });
    }

    await client.query("BEGIN");

    // 🏢 CREAR EMPRESA
    const empresaResult = await client.query(
      `INSERT INTO empresas (nombre, nit, email, telefono)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [nombre, nit, email, telefono]
    );

    const empresa = empresaResult.rows[0];

    // 🔐 HASH CONTRASEÑA
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 👤 CREAR ADMIN
    const usuarioResult = await client.query(
      `INSERT INTO persona (
        empresa_id, nombre, apellido, usuario, contrasena,
        telefono, direccion, tipo_documento,
        numero_documento, rol_id, id_municipio
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,$10)
      RETURNING *`,
      [
        empresa.id,
        nombre_admin,
        apellido_admin,
        usuario,
        hashedPassword,
        telefono_admin,
        direccion,
        tipo_documento,
        numero_documento,
        id_municipio
      ]
    );

    const admin = usuarioResult.rows[0];

    // 🔥 GENERAR TOKEN (ANTES DEL COMMIT)
    const token = generarToken({
      id: admin.id,
      empresa_id: admin.empresa_id,
      rol_id: admin.rol_id
    });

    // ✅ TODO BIEN → GUARDAR
    await client.query("COMMIT");

    // 🎯 RESPUESTA FINAL
    res.json({
      message: "Empresa registrada correctamente 🚀",
      token,
      usuario: admin.usuario,
      empresa_id: admin.empresa_id,
      rol_id: admin.rol_id
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ ERROR REGISTRO:", error);

    // 🛑 ERRORES ESPECÍFICOS
    if (error.code === "23505") {
      return res.status(400).json({
        error: "El usuario o la empresa ya existen"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Municipio inválido"
      });
    }

    res.status(500).json({
      error: "Error interno al registrar empresa"
    });

  } finally {
    client.release();
  }
};