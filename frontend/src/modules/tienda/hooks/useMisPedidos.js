import { useState, useEffect, useCallback } from "react";
import { getMisPedidos } from "../services/tiendaService";

const POLLING_MS = 30_000; // 30 segundos

export function useMisPedidos(token) {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);
  const [ultimaVez, setUltimaVez] = useState(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    const data = await getMisPedidos(token);
    if (Array.isArray(data)) {
      setPedidos(data);
      setUltimaVez(new Date());
    } else {
      setError("No se pudieron cargar los pedidos.");
    }
    setCargando(false);
  }, [token]);

  // Carga inicial
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Polling
  useEffect(() => {
    const interval = setInterval(cargar, POLLING_MS);
    return () => clearInterval(interval);
  }, [cargar]);

  return { pedidos, cargando, error, ultimaVez, recargar: cargar };
}
