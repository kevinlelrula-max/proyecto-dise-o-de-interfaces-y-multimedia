import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getDashboard);

export default router;
