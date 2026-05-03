import { Router } from "express";
import {
  getConfiguracion,
  updateDatosEmpresa,
  updateMetodosPago,
  subirLogo,
  uploadLogo,
} from "../controllers/configuracion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// GET  /api/configuracion          → datos de empresa + métodos de pago
router.get("/",             verificarToken, getConfiguracion);

// PUT  /api/configuracion/empresa  → actualiza nombre, nit, email, teléfono, dirección
router.put("/empresa",      verificarToken, updateDatosEmpresa);

// PUT  /api/configuracion/metodos  → activa/desactiva métodos de pago
router.put("/metodos",      verificarToken, updateMetodosPago);

// POST /api/configuracion/logo     → sube o reemplaza el logo
router.post("/logo",        verificarToken, uploadLogo.single("logo"), subirLogo);

export default router;
