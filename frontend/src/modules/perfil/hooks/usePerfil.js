import { useEffect, useState } from "react";
import { getPerfil, actualizarPerfil } from "../services/perfil.api";

export default function usePerfil() {
  const [perfil, setPerfil] = useState({});
  const token = localStorage.getItem("token");

  const cargarPerfil = async () => {
    const data = await getPerfil(token);
    setPerfil(data);
  };

  const guardarPerfil = async (data) => {
    await actualizarPerfil(data, token);
    cargarPerfil();
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  return { perfil, guardarPerfil };
}