import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/clientes`;

const headers = (token) => ({ Authorization: `Bearer ${token}` });

export const getPerfil = async (token) => {
  const res = await axios.get(`${BASE}/perfil`, { headers: headers(token) });
  return res.data;
};

export const actualizarPerfil = async (token, datos) => {
  const res = await axios.put(`${BASE}/perfil`, datos, { headers: headers(token) });
  return res.data;
};

export const cambiarPassword = async (token, datos) => {
  const res = await axios.put(`${BASE}/perfil/password`, datos, { headers: headers(token) });
  return res.data;
};
