import { Router } from "express";
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  upload
} from "../controllers/productos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
 
const router = Router();
 
router.get("/",      verificarToken, getProductos);
// ✅ upload.single("imagen") procesa el archivo antes del controlador
router.post("/",     verificarToken, upload.single("imagen"), crearProducto);
router.put("/:id",   verificarToken, upload.single("imagen"), actualizarProducto);
router.delete("/:id",verificarToken, eliminarProducto);
 
export default router;
 