import { Router } from "express";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  toggleUsuario,
  eliminarUsuario,
  getRoles,
  getTodosRoles,
  crearRol,
  getPermisosRol,
  actualizarPermisosRol,
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
router.get("/roles",              verificarToken, getRoles);
router.get("/roles/todos",        verificarToken, getTodosRoles);
router.post("/roles",             verificarToken, crearRol);
router.get("/roles/:rol_id/permisos",    verificarToken, getPermisosRol);
router.put("/roles/:rol_id/permisos",    verificarToken, actualizarPermisosRol);

// Usuarios — rutas generales
router.get("/",             verificarToken, getUsuarios);
router.post("/",            verificarToken, crearUsuario);

// Usuarios — rutas con parámetro AL FINAL
router.put("/:id",          verificarToken, actualizarUsuario);
router.patch("/:id/toggle", verificarToken, toggleUsuario);
router.delete("/:id",       verificarToken, eliminarUsuario);

export default router;