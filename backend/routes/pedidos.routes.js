import express from "express";
import {
  crearPedido,
  getMisPedidos,
  getEstadoPedido,
  getPedidosEmpresa,
  actualizarEstadoPedido,
} from "../controllers/pedidos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/",                   crearPedido);
router.get("/mis-pedidos",         verificarToken, getMisPedidos);
router.get("/empresa",             verificarToken, getPedidosEmpresa);
router.get("/:id/estado",          verificarToken, getEstadoPedido);
router.put("/:id/estado",          verificarToken, actualizarEstadoPedido);

export default router;