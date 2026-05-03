import express from "express";
import { crearPedido, getMisPedidos, getEstadoPedido } from "../controllers/pedidos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", crearPedido);

router.get("/mis-pedidos", verificarToken, getMisPedidos);
router.get("/:id/estado", verificarToken, getEstadoPedido);
export default router;