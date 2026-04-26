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

      setToast({
        type: "success",
        message: "Venta realizada correctamente"
      });

      setTimeout(() => setToast(null), 3000);

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

  return (
    <div className="pos-wrap">

      {/* TOAST */}
      {toast && (
        <div className="toast">
          {toast.type === "success" ? "✅" : "⚠️"} {toast.message}
        </div>
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