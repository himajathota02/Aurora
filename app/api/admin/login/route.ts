import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const cookieName = "aurora-admin-session";
function sessionValue(password: string) {
  return createHmac("sha256", password).update("aurora-admin-v1").digest("hex");
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Use the Supabase administrator sign-in." }, { status: 400 });
  }
  const password = process.env.AURORA_ADMIN_PASSWORD;
  if (!password) return NextResponse.json({ error: "Set AURORA_ADMIN_PASSWORD in .env.local to enable local demo editing." }, { status: 503 });
  let supplied = "";
  try { supplied = String((await request.json()).password || ""); } catch { /* Invalid JSON is handled as a failed login. */ }
  const expectedHash = createHmac("sha256", password).update(supplied).digest();
  const actualHash = createHmac("sha256", password).update(password).digest();
  if (!timingSafeEqual(expectedHash, actualHash)) return NextResponse.json({ error: "That password did not match." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, sessionValue(password), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
