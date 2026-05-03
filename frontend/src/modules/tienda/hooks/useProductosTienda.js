import { useState, useEffect, useMemo } from "react";
import { getProductosPesquera } from "../services/tiendaService";

export function useProductosTienda() {
  const [productos, setProductos]       = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState(null);
  const [busqueda, setBusqueda]         = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  useEffect(() => {
    (async () => {
      setCargando(true);
      const data = await getProductosPesquera();
      if (!Array.isArray(data)) {
        setError("No se pudieron cargar los productos.");
      } else {
        setProductos(data);
      }
      setCargando(false);
    })();
  }, []);

  // Categorías únicas derivadas de los productos
  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.categoria || "Sin categoría"))];
    return ["Todos", ...cats.sort()];
  }, [productos]);

  // Productos filtrados por búsqueda y categoría
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaActiva === "Todos" || p.categoria === categoriaActiva;
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaActiva]);

  return {
    productos,
    productosFiltrados,
    categorias,
    cargando,
    error,
    busqueda,
    setBusqueda,
    categoriaActiva,
    setCategoriaActiva,
  };
}