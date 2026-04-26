import { Router } from "express";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleUsuario,
  eliminarUsuario,
  getRoles,
  crearRol,
  getPerfil,
  actualizarPerfil
} from "../controllers/usuarios.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Rutas específicas SIEMPRE antes de /:id
// Perfil
router.get("/perfil",       verificarToken, getPerfil);
router.put("/perfil",       verificarToken, actualizarPerfil);

// Roles
router.get("/roles",        verificarToken, getRoles);
router.post("/roles",       verificarToken, crearRol);

// Usuarios — rutas generales
router.get("/",             verificarToken, getUsuarios);
router.post("/",            verificarToken, crearUsuario);

// Usuarios — rutas con parámetro AL FINAL
router.put("/:id",          verificarToken, actualizarUsuario);
router.patch("/:id/toggle", verificarToken, toggleUsuario);
router.delete("/:id",       verificarToken, eliminarUsuario);

export default router;