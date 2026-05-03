import { Router } from "express";
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  toggleEstadoCategoria,
  eliminarCategoria
} from "../controllers/Categorias.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/",           verificarToken, getCategorias);
router.post("/",          verificarToken, crearCategoria);
router.put("/:id",        verificarToken, actualizarCategoria);
router.patch("/:id/toggle", verificarToken, toggleEstadoCategoria); // ✅ PATCH para toggle
router.delete("/:id",     verificarToken, eliminarCategoria);

export default router;
