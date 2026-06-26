import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ orders: [], preview: true });
  }

  const profile = await requireRole(["admin"]);
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, addresses(street, city, zip), profiles!orders_customer_id_fkey(full_name, phone, email)")
    .not("status", "eq", "cancelled")
    .order("pickup_date", { ascending: true })
    .limit(50);

  return NextResponse.json({ orders: orders ?? [] });
}
