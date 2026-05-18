import { Router } from "express";
import { getNotificaciones } from "../controllers/notificaciones.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getNotificaciones);

export default router;
