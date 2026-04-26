import { useEffect, useState } from "react";
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from "../services/clientes.api";

export default function useClientes() {
  const [clientes, setClientes] = useState([]);

  const token = localStorage.getItem("token");

  const cargarClientes = async () => {
    const data = await getClientes(token);
    setClientes(data);
  };

  const agregarCliente = async (cliente) => {
    await crearCliente(cliente, token);
    cargarClientes();
  };

  const editarCliente = async (id, cliente) => {
    await actualizarCliente(id, cliente, token);
    cargarClientes();
  };

  const borrarCliente = async (id) => {
    await eliminarCliente(id, token);
    cargarClientes();
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  return {
    clientes,
    agregarCliente,
    editarCliente,
    borrarCliente
  };
}