import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { available } = await request.json();

  await supabase
    .from("driver_profiles")
    .update({ available: !!available })
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
