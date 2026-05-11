import { useState, useEffect } from "react";
import { getPerfil, actualizarPerfil, cambiarPassword } from "../services/perfilCliente.api";

function leerToken() {
  return localStorage.getItem("cliente_token") || null;
}

export function usePerfilCliente() {
  const [perfil, setPerfil]         = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState("");
  const [exito, setExito]           = useState("");

  // ── Cargar perfil al montar ──────────────────────────────────
  useEffect(() => {
    const token = leerToken();
    if (!token) { setCargando(false); return; }

    getPerfil(token)
      .then((data) => setPerfil(data))
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setCargando(false));
  }, []);

  // ── Limpiar mensajes ─────────────────────────────────────────
  const limpiarMensajes = () => { setError(""); setExito(""); };

  // ── Actualizar datos personales ──────────────────────────────
  const guardarDatos = async (datos) => {
    limpiarMensajes();
    const token = leerToken();
    if (!token) return setError("Sesión expirada. Inicia sesión de nuevo.");

    try {
      const actualizado = await actualizarPerfil(token, datos);
      setPerfil(actualizado);
      // Sincronizar nombre en localStorage
      localStorage.setItem("cliente_nombre", actualizado.nombre || actualizado.usuario || "");
      setExito("Datos actualizados correctamente.");
    } catch (e) {
      setError(e?.response?.data?.error || "Error al actualizar los datos.");
    }
  };

  // ── Cambiar contraseña ───────────────────────────────────────
  const actualizarPassword = async (datos) => {
    limpiarMensajes();
    const token = leerToken();
    if (!token) return setError("Sesión expirada. Inicia sesión de nuevo.");

    try {
      await cambiarPassword(token, datos);
      setExito("Contraseña cambiada correctamente.");
    } catch (e) {
      setError(e?.response?.data?.error || "Error al cambiar la contraseña.");
    }
  };

  return {
    perfil,
    cargando,
    error,
    exito,
    limpiarMensajes,
    guardarDatos,
    actualizarPassword,
  };
}
