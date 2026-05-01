import { NextResponse } from "next/server";
import { authCookieNames, getCookieOptions } from "../../../../lib/auth-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(authCookieNames.session, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });

  return response;
}
