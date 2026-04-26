import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { generarToken } from "../utils/jwt.js";

export const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
    }

    // ✅ SELECT explícito — nunca mandar la contraseña hasheada al frontend
    const result = await pool.query(
      `SELECT id, nombre, apellido, usuario, empresa_id, rol_id, contrasena
       FROM persona WHERE usuario = $1`,
      [usuario]
    );

    // ✅ Mensaje genérico — no revelar si el usuario existe o no
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = result.rows[0];

    // ✅ Bloquear clientes internos (rol_id 4 sin acceso real)
    // Los clientes internos tienen contraseña generada con Date.now(),
    // pero este bloqueo explícito es más seguro y claro
    if (user.rol_id === 4) {
      return res.status(403).json({ error: "Este usuario no tiene acceso a la plataforma" });
    }

    // ✅ Solo bcrypt — eliminada la comparación en texto plano
    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = generarToken(user);

    // ✅ No incluir contrasena en la respuesta
    res.json({
      token,
      usuario: user.usuario,
      empresa_id: user.empresa_id,
      rol_id: user.rol_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
};