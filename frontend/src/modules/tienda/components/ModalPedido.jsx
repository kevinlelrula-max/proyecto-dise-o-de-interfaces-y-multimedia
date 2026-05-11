import { useState, useEffect } from "react";
import { loginCliente, registroCliente } from "../../../services/api";
import { getMetodosPago, crearPedido, crearPaymentIntent, EMPRESA_ID } from "../services/tiendaService";
import PagoStripe from "./PagoStripe";

function formatPrecio(p) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(p);
}

function guardarSesion(data) {
  // Guardar en ambos formatos para que el navbar y el modal estén sincronizados
  localStorage.setItem("cliente", JSON.stringify(data));
  localStorage.setItem("cliente_token", data.token);
  localStorage.setItem("cliente_id", data.id);
  localStorage.setItem("cliente_nombre", data.nombre || data.usuario || "");
}
function leerSesion() {
  try {
    // Primero intentar con el formato del LoginCliente.jsx (cliente_token)
    const token = localStorage.getItem("cliente_token");
    const id    = localStorage.getItem("cliente_id");
    if (token && id) {
      return {
        token,
        id:     Number(id),
        nombre: localStorage.getItem("cliente_nombre") || "",
      };
    }
    // Fallback: formato antiguo (objeto JSON en "cliente")
    const raw = localStorage.getItem("cliente");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function ModalPedido({ items, total, onCerrar, onExito }) {
  const [paso, setPaso]             = useState("auth");
  const [authTab, setAuthTab]       = useState("login");
  const [cliente, setCliente]       = useState(null);
  const [metodos, setMetodos]       = useState([]);
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState("");
  const [clientSecret, setClientSecret] = useState(null);

  const [loginData, setLoginData]   = useState({ usuario: "", contrasena: "" });
  const [regData, setRegData]       = useState({
    nombre: "", apellido: "", usuario: "", contrasena: "", telefono: "",
  });
  const [pedidoData, setPedidoData] = useState({
    direccion_entrega: "", metodo_pago_id: "", notas: "",
  });

  useEffect(() => {
    const sesion = leerSesion();
    if (sesion) {
      setCliente(sesion);
      setPaso("pedido");
    }
    getMetodosPago().then(setMetodos);
  }, []);

  const handleLogin = async () => {
    setError(""); setCargando(true);
    const res = await loginCliente(loginData);
    setCargando(false);
    if (res.error) return setError(res.error);
    guardarSesion(res);
    setCliente(res);
    setPaso("pedido");
  };

  const handleRegistro = async () => {
    setError(""); setCargando(true);
    const res = await registroCliente(regData);
    setCargando(false);
    if (res.error) return setError(res.error);

    if (res.token && res.id) {
      guardarSesion(res);
      setCliente(res);
      setPaso("pedido");
      return;
    }

    setCargando(true);
    const login = await loginCliente({ usuario: regData.usuario, contrasena: regData.contrasena });
    setCargando(false);
    if (login.error) return setError("Registro exitoso. Inicia sesión.");
    guardarSesion(login);
    setCliente(login);
    setPaso("pedido");
  };

  const esMetodoTarjeta = () => {
    const metodo = metodos.find((m) => m.id === Number(pedidoData.metodo_pago_id));
    return metodo?.metodo?.toLowerCase() === "tarjeta";
  };

  const handlePedido = async () => {
    if (!pedidoData.metodo_pago_id) return setError("Selecciona un método de pago.");
    if (!pedidoData.direccion_entrega.trim()) return setError("Ingresa la dirección de entrega.");

    const sesion = leerSesion();
    if (!sesion) {
      setError("Sesión expirada. Inicia sesión de nuevo.");
      setPaso("auth");
      return;
    }

    // Si es tarjeta, primero crear el PaymentIntent y mostrar Stripe
    if (esMetodoTarjeta()) {
      setError(""); setCargando(true);
      const res = await crearPaymentIntent(total);
      setCargando(false);
      if (res.error) return setError(res.error);
      setClientSecret(res.client_secret);
      setPaso("pago");
      return;
    }

    // Otros métodos: crear pedido directo
    setError(""); setCargando(true);
    const body = buildPedidoBody(sesion);
    const res = await crearPedido(body, sesion.token);
    setCargando(false);
    if (res.error) return setError(res.error);
    onExito(res);
  };

  const handlePagoExitoso = async (paymentIntentId) => {
    const sesion = leerSesion();
    if (!sesion) {
      setError("Sesión expirada.");
      setPaso("auth");
      return;
    }

    setCargando(true);
    const body = { ...buildPedidoBody(sesion), stripe_payment_intent_id: paymentIntentId };
    const res = await crearPedido(body, sesion.token);
    setCargando(false);
    if (res.error) {
      setError(res.error);
      setPaso("pedido");
      return;
    }
    onExito(res);
  };

  const buildPedidoBody = (sesion) => ({
    empresa_id:        EMPRESA_ID,
    cliente_id:        sesion.id,
    metodo_pago_id:    Number(pedidoData.metodo_pago_id),
    direccion_entrega: pedidoData.direccion_entrega,
    notas:             pedidoData.notas || "",
    total,
    items: items.map((i) => ({
      producto_id:     i.id,
      kilos:           i.kilos,
      precio_unitario: i.precio,
    })),
  });

  const cerrarSesion = () => {
    localStorage.removeItem("cliente");
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    setCliente(null);
    setPaso("auth");
    setError("");
  };

  const tituloPaso = {
    auth:   "Identifícate para continuar",
    pedido: "Confirmar pedido",
    pago:   "Pago con tarjeta",
  }[paso];

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <span style={s.headerTitle}>{tituloPaso}</span>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        <div style={s.body}>
          {/* ── PASO AUTH ── */}
          {paso === "auth" && (
            <>
              <div style={s.tabs}>
                {["login", "registro"].map((t) => (
                  <button key={t}
                    style={{ ...s.tab, ...(authTab === t ? s.tabActive : {}) }}
                    onClick={() => { setAuthTab(t); setError(""); }}
                  >
                    {t === "login" ? "Ya tengo cuenta" : "Crear cuenta"}
                  </button>
                ))}
              </div>

              {authTab === "login" ? (
                <div style={s.form}>
                  <Campo label="Usuario" value={loginData.usuario}
                    onChange={(v) => setLoginData({ ...loginData, usuario: v })} />
                  <Campo label="Contraseña" type="password" value={loginData.contrasena}
                    onChange={(v) => setLoginData({ ...loginData, contrasena: v })} />
                  {error && <p style={s.error}>{error}</p>}
                  <button style={s.btnPrimary} onClick={handleLogin} disabled={cargando}>
                    {cargando ? "Ingresando…" : "Ingresar →"}
                  </button>
                </div>
              ) : (
                <div style={s.form}>
                  <div style={s.row2}>
                    <Campo label="Nombre" value={regData.nombre}
                      onChange={(v) => setRegData({ ...regData, nombre: v })} />
                    <Campo label="Apellido" value={regData.apellido}
                      onChange={(v) => setRegData({ ...regData, apellido: v })} />
                  </div>
                  <Campo label="Usuario" value={regData.usuario}
                    onChange={(v) => setRegData({ ...regData, usuario: v })} />
                  <Campo label="Contraseña" type="password" value={regData.contrasena}
                    onChange={(v) => setRegData({ ...regData, contrasena: v })} />
                  <Campo label="Teléfono" value={regData.telefono}
                    onChange={(v) => setRegData({ ...regData, telefono: v })} />
                  {error && <p style={s.error}>{error}</p>}
                  <button style={s.btnPrimary} onClick={handleRegistro} disabled={cargando}>
                    {cargando ? "Creando cuenta…" : "Crear cuenta →"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PASO PEDIDO ── */}
          {paso === "pedido" && (
            <>
              <div style={s.clienteInfo}>
                <span style={s.clienteNombre}>
                  👤 {cliente?.nombre || cliente?.usuario || "Cliente"}
                </span>
                <button style={s.cerrarSesionBtn} onClick={cerrarSesion}>Cambiar cuenta</button>
              </div>

              <div style={s.resumen}>
                <p style={s.resumenTitulo}>Resumen del pedido</p>
                {items.map((i) => (
                  <div key={i.id} style={s.resumenItem}>
                    <span>{i.nombre} · {i.kilos} kg</span>
                    <span style={{ fontWeight: 700 }}>{formatPrecio(i.precio * i.kilos)}</span>
                  </div>
                ))}
                <div style={s.resumenTotal}>
                  <span>Total</span>
                  <span style={s.totalValor}>{formatPrecio(total)}</span>
                </div>
              </div>

              <div style={s.form}>
                <div style={s.campo}>
                  <label style={s.label}>Método de pago</label>
                  <select style={s.select} value={pedidoData.metodo_pago_id}
                    onChange={(e) => setPedidoData({ ...pedidoData, metodo_pago_id: e.target.value })}>
                    <option value="">Seleccionar…</option>
                    {metodos.map((m) => (
                      <option key={m.id} value={m.id}>{m.metodo}</option>
                    ))}
                  </select>
                </div>
                <Campo label="Dirección de entrega" value={pedidoData.direccion_entrega}
                  onChange={(v) => setPedidoData({ ...pedidoData, direccion_entrega: v })} />
                <Campo label="Notas (opcional)" value={pedidoData.notas}
                  onChange={(v) => setPedidoData({ ...pedidoData, notas: v })} />
                {error && <p style={s.error}>{error}</p>}
                <button style={s.btnPrimary} onClick={handlePedido} disabled={cargando}>
                  {cargando
                    ? "Procesando…"
                    : esMetodoTarjeta()
                    ? `Continuar al pago · ${formatPrecio(total)}`
                    : `Confirmar pedido · ${formatPrecio(total)}`}
                </button>
              </div>
            </>
          )}

          {/* ── PASO PAGO STRIPE ── */}
          {paso === "pago" && clientSecret && (
            <PagoStripe
              clientSecret={clientSecret}
              total={total}
              onExito={handlePagoExitoso}
              onVolver={() => { setPaso("pedido"); setError(""); }}
            />
          )}

          {cargando && paso === "pago" && (
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>
              Confirmando pedido…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, type = "text" }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} value={value}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" },
  header: { padding: "18px 20px", borderBottom: "1px solid #f0f7f4", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  cerrarBtn: { background: "#f0f7f4", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: "#64748b" },
  body: { padding: "20px", overflowY: "auto", flex: 1 },
  tabs: { display: "flex", marginBottom: 20, borderBottom: "2px solid #f0f7f4" },
  tab: { flex: 1, padding: "10px", border: "none", background: "none", fontSize: 14, fontWeight: 500, color: "#94a3b8", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -2, transition: "all 0.15s" },
  tabActive: { color: "#0F6E56", borderBottomColor: "#0F6E56" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  campo: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1e8e0", fontSize: 14, color: "#0f172a", outline: "none", background: "#f8faf9" },
  select: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d1e8e0", fontSize: 14, color: "#0f172a", outline: "none", background: "#f8faf9", cursor: "pointer" },
  btnPrimary: { padding: "13px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  error: { fontSize: 13, color: "#ef4444", margin: 0, fontWeight: 500 },
  clienteInfo: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f7f4", borderRadius: 10, padding: "10px 14px", marginBottom: 16 },
  clienteNombre: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
  cerrarSesionBtn: { background: "none", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer" },
  resumen: { background: "#f8faf9", borderRadius: 12, padding: "14px", marginBottom: 18, border: "1px solid #e8f0ed" },
  resumenTitulo: { fontSize: 12, fontWeight: 700, color: "#0F6E56", textTransform: "uppercase", margin: "0 0 10px", letterSpacing: "0.04em" },
  resumenItem: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "4px 0", borderBottom: "1px solid #e8f0ed" },
  resumenTotal: { display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 4 },
  totalValor: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
};
