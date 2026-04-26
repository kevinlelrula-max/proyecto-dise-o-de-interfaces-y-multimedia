import express from "express";
import cors from "cors";

// 🔹 RUTAS
import productosRoutes from "./routes/productos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import reportesRoutes from "./routes/reporteEmpresa.routes.js";
import metodoPagoRoutes from "./routes/metodoPago.routes.js";
import configuracionRoutes from "./routes/configuracion.routes.js";
import ubicacionRoutes from "./routes/ubicacion.routes.js";

const app = express();

// =========================
// 🔹 MIDDLEWARES
// =========================
app.use(cors());
app.use(express.json());

// =========================
// 🔹 TEST API
// =========================
app.get("/", (req, res) => {
  res.send("API Fishware funcionando 🚀");
});

// =========================
// 🔹 RUTAS
// =========================
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/empresa", authRoutes);

// 🔥 REPORTES (ESTO ES LO CLAVE)
app.use("/api/reportesEmpresa", reportesRoutes);

app.use("/api/metodo_pago", metodoPagoRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/ubicacion", ubicacionRoutes);
app.use("/api/configuracion", configuracionRoutes);

// =========================
// 🔹 404 HANDLER (MUY IMPORTANTE)
// =========================
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: req.originalUrl
  });
});

export default app;