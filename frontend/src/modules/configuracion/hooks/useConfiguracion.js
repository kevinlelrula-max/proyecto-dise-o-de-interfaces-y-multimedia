import { useState, useCallback } from "react";
import {
  getConfiguracion,
  updateDatosEmpresa,
  updateMetodosPago,
  uploadLogo,
} from "../services/configuracion.api";

const STORAGE_KEY = "fishware_configuracion";

const METODOS_INICIALES = [
  { key: "efectivo",      label: "Efectivo",        descripcion: "Pago en billetes y monedas",            activo: true  },
  { key: "transferencia", label: "Transferencia",    descripcion: "Consignación bancaria o transferencia",  activo: true  },
  { key: "nequi",         label: "Nequi",            descripcion: "Pago digital por Nequi",                activo: true  },
  { key: "tarjeta",       label: "Tarjeta",          descripcion: "Débito o crédito con datáfono",         activo: false },
];

const EMPRESA_INICIAL = {
  nombre: "", nit: "", telefono: "", email: "", direccion: "", logoUrl: null,
};

function cargarDesdeStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function guardarEnStorage(empresa, metodos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ empresa, metodos }));
  } catch { /* storage lleno */ }
}

export function useConfiguracion() {
  const local = cargarDesdeStorage();

  const [empresa, setEmpresa]         = useState(local?.empresa || EMPRESA_INICIAL);
  const [metodos, setMetodos]         = useState(local?.metodos || METODOS_INICIALES);
  const [logoPreview, setLogoPreview] = useState(local?.empresa?.logoUrl || null);
  const [logoFile, setLogoFile]       = useState(null);
  const [cargando, setCargando]       = useState(false);
  const [guardando, setGuardando]     = useState(false);
  const [error, setError]             = useState(null);
  const [exito, setExito]             = useState(false);

  // ── Carga inicial desde backend ──────────────────────────────────
  const cargarConfiguracion = useCallback(async () => {
    setCargando(true);
    try {
      const data = await getConfiguracion();

      const nuevaEmpresa = {
        nombre:    data.nombre    || "",
        nit:       data.nit       || "",
        telefono:  data.telefono  || "",
        email:     data.email     || "",
        direccion: data.direccion || "",
        logoUrl:   data.logoUrl   || null,
      };

      // Mezcla los metodos del backend con los labels del frontend
      const nuevosMetodos = METODOS_INICIALES.map((m) => {
        const fromApi = data.metodosPago?.find((dm) => dm.key === m.key);
        return fromApi ? { ...m, activo: fromApi.activo } : m;
      });

      setEmpresa(nuevaEmpresa);
      setMetodos(nuevosMetodos);
      if (data.logoUrl) setLogoPreview(data.logoUrl);
      guardarEnStorage(nuevaEmpresa, nuevosMetodos);
    } catch {
      // Backend no disponible — usa datos de localStorage (ya están en estado)
    } finally {
      setCargando(false);
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleEmpresaChange = useCallback((campo, valor) => {
    setEmpresa((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const toggleMetodo = useCallback((key) => {
    setMetodos((prev) =>
      prev.map((m) => (m.key === key ? { ...m, activo: !m.activo } : m))
    );
  }, []);

  const handleLogoChange = useCallback((file) => {
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ── Guardar ───────────────────────────────────────────────────────
  const guardar = useCallback(async () => {
    setGuardando(true);
    setError(null);
    setExito(false);

    // Persiste localmente siempre
    guardarEnStorage(empresa, metodos);

    try {
      await updateDatosEmpresa({
        nombre:    empresa.nombre,
        nit:       empresa.nit,
        telefono:  empresa.telefono,
        email:     empresa.email,
        direccion: empresa.direccion,
      });

      await updateMetodosPago(
        metodos.map(({ key, activo }) => ({ key, activo }))
      );

      if (logoFile) {
        const { logoUrl } = await uploadLogo(logoFile);
        setEmpresa((prev) => ({ ...prev, logoUrl }));
        setLogoFile(null);
      }

      setExito(true);
    } catch (err) {
      // Guardado local funcionó — avisamos que el servidor falló
      setError("Cambios guardados localmente. No se pudo sincronizar con el servidor.");
      setExito(true); // igual mostramos éxito parcial
    } finally {
      setGuardando(false);
      setTimeout(() => { setExito(false); setError(null); }, 4000);
    }
  }, [empresa, metodos, logoFile]);

  return {
    empresa, metodos, logoPreview,
    cargando, guardando, error, exito,
    cargarConfiguracion,
    handleEmpresaChange,
    toggleMetodo,
    handleLogoChange,
    guardar,
  };
}