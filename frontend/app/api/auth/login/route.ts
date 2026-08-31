import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(data ?? { message: "Não foi possível entrar." }, { status: backendResponse.status });
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(SESSION_COOKIE, data.token, sessionCookieOptions);
  return response;
}
