import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const password = process.env.AURORA_ADMIN_PASSWORD;
  const cookieStore = await cookies();
  const candidate = cookieStore.get("aurora-admin-session")?.value || "";
  const expected = password ? createHmac("sha256", password).update("aurora-admin-v1").digest("hex") : "";
  const valid = Boolean(password && candidate && candidate.length === expected.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(expected)));
  return NextResponse.json({ valid });
}
