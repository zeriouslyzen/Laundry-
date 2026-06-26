import { NextResponse } from "next/server";

/** Accepts community suggestions — logs for now; wire to email/DB later */
export async function POST(request: Request) {
  const body = await request.json();
  console.info("[community suggestion]", {
    name: body.name,
    email: body.email,
    message: body.message,
    at: body.createdAt,
  });
  return NextResponse.json({ ok: true });
}
