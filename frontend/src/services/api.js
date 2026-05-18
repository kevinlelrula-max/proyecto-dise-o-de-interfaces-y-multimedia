import axios from "axios";

// ✅ Usa variable de entorno en producción, localhost en desarrollo
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

// =========================
// 🔹 REGISTRO USUARIO
// =========================
export const register = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en registro" };
  }
};

// =========================
// 🔹 REGISTRO EMPRESA
// =========================
export const registroEmpresa = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/empresa/registro`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en registro empresa" };
  }
};

// =========================
// 🔹 LOGIN EMPRESA
// =========================
export const loginEmpresa = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login empresa" };
  }
};

// =========================
// 🔹 LOGIN USUARIO
// =========================
export const login = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios/login`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login de usuario" };
  }
};

// =========================
// 🛒 REGISTRO CLIENTE
// =========================
export const registroCliente = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/clientes/registro`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en registro de cliente" };
  }
};

// =========================
// 🛒 LOGIN CLIENTE
// =========================
export const loginCliente = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/clientes/login`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login de cliente" };
  }
};

// =========================
// 🛒 EMPRESA POR SLUG
// =========================
export const getEmpresaPorSlug = async (slug) => {
  try {
    const res = await axios.get(`${API_URL}/empresa/slug/${slug}`);
    return res.data;
  } catch (error) {
    console.error("Error getEmpresaPorSlug:", error);
    return null;
  }
};

// =========================
// 🛒 EMPRESAS PÚBLICAS
// =========================
export const getEmpresasPublicas = async () => {
  try {
    const res = await axios.get(`${API_URL}/tienda/empresas`);
    return res.data;
  } catch (error) {
    console.error("Error getEmpresasPublicas:", error);
    return [];
  }
};

// =========================
// 🛒 PRODUCTOS PÚBLICOS
// =========================
export const getProductosPublicos = async (empresaId) => {
  try {
    const res = await axios.get(`${API_URL}/productos/publicos/${empresaId}`);
    return res.data;
  } catch (error) {
    console.error("Error getProductosPublicos:", error);
    return [];
  }
};

// =========================
// 🛒 CREAR PEDIDO ONLINE
// =========================
export const crearPedidoOnline = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/pedidos`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error al crear pedido" };
  }
};

// =========================
// 🛒 MIS PEDIDOS (cliente)
// =========================
export const getMisPedidos = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/pedidos/mis-pedidos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getMisPedidos:", error);
    return [];
  }
};

// =========================
// 🛒 ESTADO DE UN PEDIDO
// =========================
export const getEstadoPedido = async (pedidoId, token) => {
  try {
    const res = await axios.get(`${API_URL}/pedidos/${pedidoId}/estado`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getEstadoPedido:", error);
    return null;
  }
};

// =========================
// 🔥 PEDIDOS ONLINE (panel empresa)
// =========================
export const getPedidosOnlineEmpresa = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/pedidos/empresa`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getPedidosOnlineEmpresa:", error);
    return [];
  }
};

// =========================
// 🔥 ACTUALIZAR ESTADO PEDIDO
// =========================
export const actualizarEstadoPedido = async (pedidoId, estado, token) => {
  try {
    const res = await axios.patch(
      `${API_URL}/pedidos/${pedidoId}/estado`,
      { estado },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error al actualizar estado" };
  }
};

// =========================
// 🔹 PRODUCTOS
// =========================
export const getProductos = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/productos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const agregarProducto = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/productos`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return { error: "No se pudo agregar el producto" };
  }
};

// =========================
// 🔹 CLIENTES (panel empresa)
// =========================
export const agregarCliente = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return { error: "No se pudo agregar el cliente" };
  }
};

export const getClientes = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// =========================
// 🔹 VENTAS (POS)
// =========================
export const crearVenta = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/ventas`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error al crear venta" };
  }
};

export const getVentas = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/ventas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getVentasEmpresa = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/ventas/empresa`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getVentasEmpresa:", error);
    return [];
  }
};

// =========================
// 🔹 MÉTODOS DE PAGO
// =========================
export const getMetodosPago = async () => {
  try {
    const res = await axios.get(`${API_URL}/metodo_pago`);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// =========================
// 🔹 REPORTES
// =========================
export const getReporteProductos = async (token, { desde, hasta } = {}) => {
  try {
    const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : "";
    const res = await axios.get(`${API_URL}/ventas/reportes/productos${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error reporte:", error);
    return [];
  }
};

export const getReporteResumen = async (token, { desde, hasta } = {}) => {
  try {
    const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : "";
    const res = await axios.get(`${API_URL}/reportesEmpresa/resumen${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error resumen:", error);
    return null;
  }
};

// =========================
// 🔹 HISTORIAL CLIENTE
// =========================
export const getHistorialCliente = async (clienteId, token) => {
  try {
    const res = await axios.get(`${API_URL}/ventas/cliente/${clienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error historial cliente:", error);
    return [];
  }
};

// =========================
// 🏠 DASHBOARD INICIO
// =========================
export const getDashboard = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error dashboard:", error);
    return null;
  }
};

// =========================
// 🛒 PRODUCTOS TIENDA
// =========================
export const getProductosTienda = async () => {
  try {
    const res = await axios.get(`${API_URL}/tienda/productos`);
    return res.data;
  } catch (error) {
    console.error("Error getProductosTienda:", error);
    return [];
  }
};