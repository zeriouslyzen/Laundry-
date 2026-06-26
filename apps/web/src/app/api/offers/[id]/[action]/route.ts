import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptOffer, declineOffer } from "@/lib/matching";
import { sendSMS, SMS_TEMPLATES } from "@/lib/sms";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (action === "accept") {
    const result = await acceptOffer(supabase, id, user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("customer_id, profiles!orders_customer_id_fkey(phone)")
      .eq("id", result.orderId)
      .single();

    const { data: driverProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const phone = (order as { profiles?: { phone: string } | { phone: string }[] })?.profiles;
    const phoneNumber = Array.isArray(phone) ? phone[0]?.phone : phone?.phone;
    if (phoneNumber && driverProfile?.full_name) {
      await sendSMS(phoneNumber, SMS_TEMPLATES.driverAssigned(driverProfile.full_name));
    }

    return NextResponse.json({ success: true, orderId: result.orderId });
  }

  if (action === "decline") {
    await declineOffer(supabase, id, user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
