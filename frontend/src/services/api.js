import axios from "axios";

const API_URL = "http://localhost:3000/api";

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
// 🛒 REGISTRO CLIENTE (tienda)
// Crea una persona con rol_id: 4 y empresa_id: null
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
// 🛒 LOGIN CLIENTE (tienda)
// Usa el mismo auth pero verifica rol_id === 4
// =========================
export const loginCliente = async (data) => {
  try {
    const res = await axios.post("http://localhost:3000/api/clientes/login", data)
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login de cliente" };
  }
};
// =========================
// 🛒 EMPRESAS PÚBLICAS (marketplace)
// No requiere token — listado público para la tienda
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
// 🛒 PRODUCTOS PÚBLICOS DE UNA EMPRESA
// No requiere token — catálogo público por slug o id
// =========================
export const getProductosPublicos = async (empresaSlug) => {
  try {
    const res = await axios.get(`${API_URL}/tienda/empresas/${empresaSlug}/productos`);
    return res.data;
  } catch (error) {
    console.error("Error getProductosPublicos:", error);
    return [];
  }
};

// =========================
// 🛒 CREAR PEDIDO ONLINE
// Requiere token del cliente
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
// Historial de pedidos del cliente logueado
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
// 🛒 ESTADO DE UN PEDIDO (polling)
// Se llama cada 30 seg para ver si cambió el estado
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
// 🔥 PEDIDOS ONLINE (panel cajero)
// El cajero ve los pedidos online de su empresa
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
// 🔥 ACTUALIZAR ESTADO PEDIDO (cajero)
// El cajero cambia el estado: pendiente → confirmado → etc.
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
// 🔹 VENTAS (POS - CREAR)
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

// =========================
// 🔹 VENTAS (GENERAL)
// =========================
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

// =========================
// 🔥 VENTAS EMPRESA (HISTORIAL)
// =========================
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
// 🔹 REPORTES PRODUCTOS
// =========================
export const getReporteProductos = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/ventas/reportes/productos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error reporte:", error);
    return [];
  }
};

// =========================
// 🛒 PRODUCTOS TIENDA (empresa fija)
// Catálogo público de Pesquera Estrada
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