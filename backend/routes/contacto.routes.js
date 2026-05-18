import { Router } from "express";
import { enviarMensaje, getMensajes, marcarLeido } from "../controllers/contacto.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Público — formulario de la tienda
router.post("/", enviarMensaje);

// Protegidas — panel admin
router.get("/", verificarToken, getMensajes);
router.patch("/:id/leido", verificarToken, marcarLeido);

export default router;
