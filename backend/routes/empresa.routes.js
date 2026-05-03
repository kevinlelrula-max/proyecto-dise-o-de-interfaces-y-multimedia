import { Router } from "express";
import {
  registrarEmpresa,
  getEmpresasPublicas
} from "../controllers/empresa.controller.js";

const router = Router();

// 🏢 Públicas (SIN TOKEN)
router.get("/publicas", getEmpresasPublicas);

// 🏢 Registro
router.post("/registro", registrarEmpresa);

export default router;