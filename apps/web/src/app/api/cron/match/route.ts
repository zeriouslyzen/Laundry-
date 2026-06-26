import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { processExpiredOffers } from "@/lib/matching";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const result = await processExpiredOffers(supabase);
  return NextResponse.json(result);
}
