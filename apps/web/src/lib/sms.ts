export async function sendSMS(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.log(`[SMS mock] To: ${to} — ${body}`);
    return { success: true, mock: true };
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);
  await client.messages.create({ to, from, body });
  return { success: true };
}

export const SMS_TEMPLATES = {
  orderConfirmed: (orderId: string) =>
    `North Coast Laundry: Your pickup is scheduled. Track order #${orderId.slice(0, 8)} at ${process.env.NEXT_PUBLIC_APP_URL}/book/orders/${orderId}`,
  driverAssigned: (driverName: string) =>
    `North Coast Laundry: ${driverName} has been assigned to your order and will arrive during your pickup window.`,
  enRoute: () =>
    `North Coast Laundry: Your driver is en route for pickup.`,
  ready: (returnMethod: string) =>
    returnMethod === "customer_pickup"
      ? `North Coast Laundry: Your laundry is clean and ready for pickup.`
      : `North Coast Laundry: Your clean laundry is on the way back to you.`,
  newOffer: (payout: string) =>
    `North Coast Laundry: New pickup available — earn ${payout}. Open the driver app to accept.`,
};
