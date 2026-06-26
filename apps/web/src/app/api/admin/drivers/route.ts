import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  const profile = await requireRole(["admin"]);
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { driverId, userId, action } = await request.json();
  const supabase = await createClient();

  const status = action === "approve" ? "active" : "rejected";

  await supabase
    .from("driver_profiles")
    .update({ status })
    .eq("id", driverId);

  if (action === "approve") {
    await supabase.from("profiles").update({ role: "driver" }).eq("id", userId);
  }

  return NextResponse.json({ success: true });
}
