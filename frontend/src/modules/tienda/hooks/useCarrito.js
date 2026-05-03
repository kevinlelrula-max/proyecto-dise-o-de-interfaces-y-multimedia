import { useState, useCallback } from "react";

export function useCarrito() {
  const [items, setItems] = useState([]);

  // Agregar producto o incrementar kilos
  const agregar = useCallback((producto, kilos = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, kilos: Number((i.kilos + kilos).toFixed(2)) }
            : i
        );
      }
      return [...prev, { ...producto, kilos }];
    });
  }, []);

  // Cambiar kilos directamente
  const cambiarKilos = useCallback((id, kilos) => {
    const k = Number(kilos);
    if (isNaN(k) || k <= 0) return eliminar(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, kilos: Number(k.toFixed(2)) } : i))
    );
  }, []);

  // Eliminar item
  const eliminar = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Vaciar carrito
  const vaciar = useCallback(() => setItems([]), []);

  // Total en pesos
  const total = items.reduce((acc, i) => acc + i.precio * i.kilos, 0);

  // Cantidad de items
  const cantidad = items.length;

  return { items, agregar, cambiarKilos, eliminar, vaciar, total, cantidad };
}