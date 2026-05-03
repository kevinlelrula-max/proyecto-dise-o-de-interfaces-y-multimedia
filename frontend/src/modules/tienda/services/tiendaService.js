import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

export const EMPRESA_ID = 1;

export const getProductosPesquera = async () => {
  try {
    const res = await axios.get(`${API_URL}/tienda/empresas/${EMPRESA_ID}/productos`);
    return res.data;
  } catch (error) {
    console.error("Error getProductosPesquera:", error);
    return [];
  }
};

export const crearPedido = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/pedidos`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error al crear pedido" };
  }
};

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

export const getMetodosPago = async () => {
  try {
    const res = await axios.get(`${API_URL}/metodo_pago`);
    return res.data;
  } catch (error) {
    console.error("Error getMetodosPago:", error);
    return [];
  }
};