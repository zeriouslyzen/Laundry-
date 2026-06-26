import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const profile = await requireRole(["admin"]);
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, basePickupFeeCents, perBagCents, foldAddonCents } = await request.json();
  const supabase = await createClient();

  await supabase
    .from("pricing_rules")
    .update({
      base_pickup_fee_cents: basePickupFeeCents,
      per_bag_cents: perBagCents,
      fold_addon_cents: foldAddonCents,
    })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
