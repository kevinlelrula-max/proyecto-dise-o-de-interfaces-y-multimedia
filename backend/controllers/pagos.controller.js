import Stripe from "stripe";

export const crearPaymentIntent = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    // Stripe espera el monto en centavos → multiplicar por 100
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount) * 100,
      currency: "cop",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error Stripe PaymentIntent:", error.message);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
};
