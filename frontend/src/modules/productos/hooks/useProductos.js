import { useEffect, useState } from "react";
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../services/productos.api";

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const token = localStorage.getItem("token");

  const cargarProductos = async () => {
    const data = await getProductos(token);
    setProductos(data);
  };

  const agregar = async (producto) => {
    await crearProducto(producto, token);
    cargarProductos();
  };

  const actualizar  = async (id, data) => {
    await actualizarProducto(id, data, token);
    cargarProductos();
  };

  const eliminar = async (id) => {
    await eliminarProducto(id, token);
    cargarProductos();
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return {
    productos,
    agregar,
    actualizar ,
    eliminar
  };
}