import { Router } from "express";
import { crearPaymentIntent } from "../controllers/pagos.controller.js";

const router = Router();

router.post("/intent", crearPaymentIntent);

export default router;
