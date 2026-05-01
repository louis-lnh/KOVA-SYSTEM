import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieNames, readSessionCookie } from "../../../../lib/auth-session";

export async function GET() {
  const cookieStore = await cookies();
  const session = readSessionCookie(cookieStore.get(authCookieNames.session)?.value);

  return NextResponse.json(
    { session },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
