import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function formatPrecio(p) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(p);
}

function FormularioPago({ total, onExito, onVolver }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const handlePagar = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError("");
    setProcesando(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    setProcesando(false);

    if (stripeError) {
      setError(stripeError.message || "Error al procesar el pago");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onExito(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handlePagar} style={s.form}>
      <div style={s.infoBox}>
        <span style={s.infoLabel}>Total a pagar</span>
        <span style={s.infoTotal}>{formatPrecio(total)}</span>
      </div>

      <div style={s.stripeWrap}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && <p style={s.error}>{error}</p>}

      <button type="submit" style={{ ...s.btnPagar, opacity: procesando || !stripe ? 0.7 : 1 }} disabled={procesando || !stripe}>
        {procesando ? "Procesando pago…" : `Pagar ${formatPrecio(total)}`}
      </button>

      <button type="button" style={s.btnVolver} onClick={onVolver}>
        ← Volver
      </button>
    </form>
  );
}

export default function PagoStripe({ clientSecret, total, onExito, onVolver }) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#3674B5",
        colorBackground: "#f8faf9",
        borderRadius: "10px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <FormularioPago total={total} onExito={onExito} onVolver={onVolver} />
    </Elements>
  );
}

const s = {
  form: { display: "flex", flexDirection: "column", gap: 16 },
  infoBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#EEF4FF", borderRadius: 12, padding: "12px 16px",
    border: "1px solid #bfdbfe",
  },
  infoLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  infoTotal: { fontSize: 20, fontWeight: 800, color: "#3674B5" },
  stripeWrap: { padding: "4px 0" },
  error: { fontSize: 13, color: "#ef4444", margin: 0, fontWeight: 500 },
  btnPagar: {
    padding: "13px", background: "#3674B5", color: "#fff",
    border: "none", borderRadius: 10, fontSize: 15,
    fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
  },
  btnVolver: {
    background: "none", border: "none", color: "#64748b",
    fontSize: 13, cursor: "pointer", textDecoration: "underline",
    padding: 0, textAlign: "left",
  },
};
