import { Router } from "express";
import {
  getClientes,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  loginCliente,
  registrarClientePublico
} from "../controllers/clientes.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();


// ✅ /buscar DEBE ir antes de /:id o Express lo interpreta como un id
router.get("/buscar", verificarToken, buscarClientes);
router.get("/",       verificarToken, getClientes);
router.post("/",      verificarToken, crearCliente);
router.put("/:id",    verificarToken, actualizarCliente);
router.delete("/:id", verificarToken, eliminarCliente);
router.post("/login", loginCliente);
router.post("/registro", registrarClientePublico);
export default router;