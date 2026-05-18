import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Home from "./pages/Home";

// Empresas
import RegistroEmpresa from "./components/RegistroEmpresa";
import LoginEmpresa from "./components/LoginEmpresa";
import DashboardEmpresa from "./components/DashboardEmpresa";
import Perfil from "./modules/perfil/Perfil";

// POS
import Ventas from "./pages/VentasEmpresa";

// Reportes
import Reportes from "./pages/Reportes";

// Tienda cliente
import LoginCliente from "./pages/LoginCliente";
import RegistroCliente from "./pages/RegistroCliente";
import TiendaInicio from "./pages/TiendaInicio";
import Tienda from "./pages/Tienda";
import TiendaContacto from "./pages/TiendaContacto";
import MisPedidos from "./pages/MisPedidos";
import PerfilCliente from "./modules/tienda/perfil/PerfilCliente";

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>

        {/* ── Página principal ── */}
        <Route path="/" element={<Home />} />

        {/* ── Empresas ── */}
        <Route path="/empresa/registro" element={<RegistroEmpresa />} />
        <Route path="/empresa/login" element={<LoginEmpresa />} />

        {/* ── Dashboard empresa ── */}
        <Route path="/dashboard" element={<DashboardEmpresa />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/reportes" element={<Reportes />} />

        {/* ── Tienda cliente ── */}
        <Route path="/tienda" element={<TiendaInicio />} />
        <Route path="/tienda/catalogo" element={<Tienda />} />
        <Route path="/tienda/contacto" element={<TiendaContacto />} />
        <Route path="/tienda/login" element={<LoginCliente />} />
        <Route path="/tienda/registro" element={<RegistroCliente />} />
        <Route path="/tienda/mis-pedidos" element={<MisPedidos />} />
        <Route path="/tienda/perfil" element={<PerfilCliente />} />

        {/* 🚫 Ruta fallback global */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />

      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;