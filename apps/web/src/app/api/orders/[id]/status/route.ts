import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSMS, SMS_TEMPLATES } from "@/lib/sms";
import type { OrderStatus } from "@humboldt/db";

const SMS_STATUSES: Partial<Record<OrderStatus, (order: { return_method: string }) => string>> = {
  en_route_pickup: () => SMS_TEMPLATES.enRoute(),
  ready: (o) => SMS_TEMPLATES.ready(o.return_method),
  en_route_return: () => SMS_TEMPLATES.ready("driver_delivery"),
  awaiting_customer_pickup: () => SMS_TEMPLATES.ready("customer_pickup"),
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, lat, lng } = await request.json();

  const { data: order } = await supabase
    .from("orders")
    .select("*, profiles!orders_customer_id_fkey(phone)")
    .eq("id", id)
    .eq("driver_id", user.id)
    .single();

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 403 });

  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
    await supabase
      .from("driver_profiles")
      .update({ active_orders_count: Math.max(0, (order as { active_orders_count?: number }).active_orders_count ?? 1) - 1 })
      .eq("user_id", user.id);
  }

  await supabase.from("orders").update(updates).eq("id", id);

  await supabase.from("order_events").insert({
    order_id: id,
    status,
    actor_id: user.id,
    lat,
    lng,
  });

  const smsFn = SMS_STATUSES[status as OrderStatus];
  const customerPhone = (() => {
    const p = (order as { profiles?: { phone: string } | { phone: string }[] }).profiles;
    return Array.isArray(p) ? p[0]?.phone : p?.phone;
  })();
  if (smsFn && customerPhone) {
    await sendSMS(customerPhone, smsFn(order));
  }

  return NextResponse.json({ success: true });
}
