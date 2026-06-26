import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isOwnerOperated } from "@/lib/owner-mode";

export async function GET() {
  return NextResponse.json({
    supabase: isSupabaseConfigured(),
    ownerOperated: isOwnerOperated(),
  });
}
