import { Router } from "express";
import { getreporteEmpresa } from "../controllers/reporteEmpresa.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔥 ESTE ES EL QUE ESTÁS LLAMANDO DESDE FRONTEND
router.get("/resumen", verificarToken, getreporteEmpresa);

export default router;