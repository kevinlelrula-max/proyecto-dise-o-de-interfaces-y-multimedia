import axios from "axios";

const API_URL = "http://localhost:3000/api";

// =========================
// 🔹 REGISTRO USUARIO
// =========================
export const register = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
// 🔹 CLIENTES
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
// 🔹 VENTAS (GENERAL - opcional)
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error reporte:", error);
    return [];
  }
};
