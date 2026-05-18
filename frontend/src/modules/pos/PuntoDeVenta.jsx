import { useEffect, useState } from "react";
import { getProductos } from "../productos/services/productos.api";
import { crearVenta } from "./services/pos.api";
import { crearCliente } from "../clientes/services/clientes.api";
import { getDepartamentos, getMunicipios } from "../ubicacion/services/ubicacion.api";

import { useCarrito } from "./hooks/useCarrito";
import { useClientes } from "./hooks/useClientes";

import ProductGrid from "./components/ProductGrid";
import Carrito from "./components/Carrito";
import ClienteSearch from "./components/ClienteSearch";
import MetodoPago from "./components/MetodoPago";
import ModalCliente from "./components/ModalCliente";
import Historial from "./components/Historial";
import Caja from "./components/Caja";

import "./styles/pos.css";

export default function PuntoDeVenta() {
  const token = localStorage.getItem("token");

  const [pestana, setPestana] = useState("venta");
  const [toast, setToast] = useState(null);
  const [ventaExitosa, setVentaExitosa] = useState(null);

  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState(1);

  const {
    carrito,
    agregarProducto,
    cambiarCantidad,
    eliminarProducto,
    total,
    setCarrito
  } = useCarrito(productos);

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const { busqueda, setBusqueda, clientes, setClientes } =
    useClientes(token);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [creandoCliente, setCreandoCliente] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    tipo_documento: "Cédula de ciudadanía",
    numero_documento: "",
    id_departamento: "",
    id_municipio: ""
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    getProductos(token).then(setProductos);
    getDepartamentos().then(setDepartamentos);
  }, []);

  const handleDepartamentoChange = async (id) => {
    setNuevoCliente({
      ...nuevoCliente,
      id_departamento: id,
      id_municipio: ""
    });

    if (!id) return setMunicipios([]);

    const data = await getMunicipios(id);
    setMunicipios(data);
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    setCreandoCliente(true);

    try {
      const creado = await crearCliente(
        {
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          telefono: nuevoCliente.telefono,
          direccion: nuevoCliente.direccion,
          tipo_documento: nuevoCliente.tipo_documento,
          numero_documento: nuevoCliente.numero_documento,
          id_municipio: nuevoCliente.id_municipio
            ? Number(nuevoCliente.id_municipio)
            : null
        },
        token
      );

      setClienteSeleccionado(creado);
      setBusqueda(`${creado.nombre} ${creado.apellido || ""}`);
      setClientes([]);
      setMostrarModal(false);

      setNuevoCliente({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        tipo_documento: "Cédula de ciudadanía",
        numero_documento: "",
        id_departamento: "",
        id_municipio: ""
      });

      setMunicipios([]);

    } catch (error) {
      alert(error.response?.data?.error || "Error al crear cliente");
    } finally {
      setCreandoCliente(false);
    }
  };

  const confirmarVenta = async () => {
    if (!clienteSeleccionado) return alert("Selecciona un cliente");
    if (!carrito.length) return alert("El carrito está vacío");

    try {
      const res = await crearVenta(
        {
          cliente_id: clienteSeleccionado.id,
          metodo_pago_id: metodoPago,
          productos: carrito.map((p) => ({
            producto_id: p.id,
            cantidad: p.cantidad
          }))
        },
        token
      );

      setVentaExitosa({
        clienteNombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`.trim(),
        total,
        id: res.id || res.venta_id || "—",
      });

      setCarrito([]);
      setClienteSeleccionado(null);
      setBusqueda("");
      setClientes([]);
      setMetodoPago(1);
      setPestana("venta");

    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.error || "Error al registrar la venta"
      });

      setTimeout(() => setToast(null), 3000);
    }
  };

  const fmt = (n) => Number(n).toLocaleString("es-CO");

  const posS = {
    overlay: {
      position: "fixed", inset: 0,
      backgroundColor: "rgba(11,22,40,0.55)",
      backdropFilter: "blur(6px)",
      zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "overlayIn 0.25s ease both",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "20px",
      padding: "40px 36px",
      maxWidth: "380px", width: "90%",
      textAlign: "center",
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      animation: "cardBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
    },
    iconWrap: { marginBottom: "16px", display: "flex", justifyContent: "center" },
    title: { fontSize: "22px", fontWeight: "800", color: "#0B1628", margin: "0 0 6px" },
    sub: { fontSize: "13px", color: "#64748b", margin: "0 0 24px" },
    resumen: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px 20px",
      display: "flex", flexDirection: "column", gap: "12px",
      marginBottom: "24px",
      textAlign: "left",
    },
    resumenRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    resumenLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "500" },
    resumenVal: { fontSize: "14px", color: "#0B1628", fontWeight: "600" },
    btnCerrar: {
      width: "100%", padding: "13px",
      backgroundColor: "#3674B5", color: "white",
      border: "none", borderRadius: "10px",
      fontSize: "14px", fontWeight: "700",
      cursor: "pointer",
    },
  };

  return (
    <div className="pos-wrap">

      {/* TOAST (errores) */}
      {toast && (
        <div className="toast">
          {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
        </div>
      )}

      {/* OVERLAY VENTA EXITOSA */}
      {ventaExitosa && (
        <>
          <style>{`
            @keyframes overlayIn   { from { opacity: 0; } to { opacity: 1; } }
            @keyframes cardBounce  {
              0%   { transform: scale(0.6); opacity: 0; }
              65%  { transform: scale(1.04); opacity: 1; }
              100% { transform: scale(1); }
            }
            @keyframes checkDraw {
              from { stroke-dashoffset: 60; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes ringPop {
              0%   { transform: scale(0.5); opacity: 0; }
              70%  { transform: scale(1.08); opacity: 1; }
              100% { transform: scale(1); }
            }
          `}</style>
          <div style={posS.overlay} onClick={() => setVentaExitosa(null)}>
            <div style={posS.card} onClick={e => e.stopPropagation()}>

              {/* Ícono animado */}
              <div style={posS.iconWrap}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
                  style={{ animation: "ringPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <circle cx="36" cy="36" r="34" fill="#EEF4FF" stroke="#3674B5" strokeWidth="2.5" />
                  <polyline
                    points="21,37 31,47 51,27"
                    stroke="#3674B5" strokeWidth="4.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    fill="none"
                    strokeDasharray="60"
                    style={{ animation: "checkDraw 0.45s ease 0.35s both" }}
                  />
                </svg>
              </div>

              <h2 style={posS.title}>¡Venta registrada!</h2>
              <p style={posS.sub}>El pedido fue procesado correctamente</p>

              {/* Resumen */}
              <div style={posS.resumen}>
                <div style={posS.resumenRow}>
                  <span style={posS.resumenLabel}>Cliente</span>
                  <span style={posS.resumenVal}>{ventaExitosa.clienteNombre}</span>
                </div>
                <div style={posS.resumenRow}>
                  <span style={posS.resumenLabel}>Total</span>
                  <span style={{ ...posS.resumenVal, color: "#3674B5", fontWeight: 800, fontSize: 18 }}>
                    ${fmt(ventaExitosa.total)}
                  </span>
                </div>
              </div>

              <button style={posS.btnCerrar} onClick={() => setVentaExitosa(null)}>
                Nueva venta
              </button>
            </div>
          </div>
        </>
      )}

      {/* TABS */}
      <div className="pos-tabs">
        <div className={`pos-tab ${pestana === "venta" ? "active" : ""}`}
          onClick={() => setPestana("venta")}>
          🛒 Venta
        </div>

        <div className={`pos-tab ${pestana === "historial" ? "active" : ""}`}
          onClick={() => setPestana("historial")}>
          📋 Historial
        </div>

        <div className={`pos-tab ${pestana === "caja" ? "active" : ""}`}
          onClick={() => setPestana("caja")}>
          💰 Caja
        </div>
      </div>

      <div className="pos-body">

        {pestana === "venta" && (
          <div className="pos-root">

            <ProductGrid
              productos={productos}
              agregarProducto={agregarProducto}
              busqueda={busquedaProducto}
              setBusqueda={setBusquedaProducto}
            />

            <div className="pos-right">

              <div className="pos-right-header">

                <div className="pos-right-header-top">
                  <h2>Venta</h2>

                  {/* 🔥 BOTÓN RESTAURADO */}
                  <button
                    onClick={() => setMostrarModal(true)}
                    className="btn-nuevo-cliente"
                  >
                    Nuevo Cliente
                  </button>
                </div>

                <ClienteSearch
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  clientes={clientes}
                  setClientes={setClientes}
                  clienteSeleccionado={clienteSeleccionado}
                  setClienteSeleccionado={setClienteSeleccionado}
                />
              </div>

              <Carrito
                carrito={carrito}
                cambiarCantidad={cambiarCantidad}
                eliminarProducto={eliminarProducto}
                fmt={fmt}
              />

              <div className="pos-footer">

                <MetodoPago
                  metodoPago={metodoPago}
                  setMetodoPago={setMetodoPago}
                />

                <div className="total-row">
                  <span>Total</span>
                  <span>${fmt(total)}</span>
                </div>

                <button
                  className="btn-confirmar"
                  onClick={confirmarVenta}
                  disabled={!carrito.length || !clienteSeleccionado}
                >
                  Confirmar venta
                </button>

              </div>

            </div>
          </div>
        )}

        {pestana === "historial" && <Historial token={token} />}
        {pestana === "caja" && <Caja token={token} />}

      </div>

      <ModalCliente
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={handleCrearCliente}
        nuevoCliente={nuevoCliente}
        setNuevoCliente={setNuevoCliente}
        creandoCliente={creandoCliente}
        departamentos={departamentos}
        municipios={municipios}
        onDepartamentoChange={handleDepartamentoChange}
      />

    </div>
  );
}