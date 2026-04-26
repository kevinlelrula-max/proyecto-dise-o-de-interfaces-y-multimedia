import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Usuarios
import Login from "./pages/Login";
import Register from "./pages/Register";

// Empresas
import RegistroEmpresa from "./components/RegistroEmpresa";
import LoginEmpresa from "./components/LoginEmpresa";
import DashboardEmpresa from "./components/DashboardEmpresa";
import Perfil from "./modules/perfil/Perfil";

// POS
import Ventas from "./pages/VentasEmpresa";

// ✅ REPORTES
import Reportes from "./pages/Reportes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Empresas */}
        <Route path="/empresa/registro" element={<RegistroEmpresa />} />
        <Route path="/empresa/login" element={<LoginEmpresa />} />

        {/* Clientes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardEmpresa />} />

        {/* Perfil */}
        <Route path="/perfil" element={<Perfil />} />

        {/* POS */}
        <Route path="/ventas" element={<Ventas />} />

        {/* 🔥 REPORTES */}
        <Route path="/reportes" element={<Reportes />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;