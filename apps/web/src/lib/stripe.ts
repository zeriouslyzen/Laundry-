import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export async function createPaymentIntent(
  amountCents: number,
  orderId: string,
  customerEmail?: string
) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return { clientSecret: null, mock: true };
  }

  const intent = await stripeClient.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: { orderId },
    receipt_email: customerEmail,
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}
