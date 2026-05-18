import { useState, useEffect, useCallback } from "react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;
const INTERVALO = 30_000; // 30 segundos

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [total, setTotal] = useState(0);

  const cargar = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotificaciones(data.items || []);
      setTotal(data.total || 0);
    } catch {}
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO);
    return () => clearInterval(id);
  }, [cargar]);

  return { notificaciones, total, recargar: cargar };
}
