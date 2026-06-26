import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, amountCents } = await request.json();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .single();

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const result = await createPaymentIntent(amountCents, orderId, profile?.email ?? undefined);

  if (result.paymentIntentId) {
    await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: result.paymentIntentId })
      .eq("id", orderId);
  }

  return NextResponse.json(result);
}
