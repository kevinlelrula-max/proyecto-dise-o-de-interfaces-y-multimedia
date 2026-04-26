import express from "express";
import { login } from "../controllers/auth.controller.js";
import { registrarEmpresa } from "../controllers/empresaController.js";

const router = express.Router();

router.post("/login", login);

router.post("/registro", registrarEmpresa);

export default router;