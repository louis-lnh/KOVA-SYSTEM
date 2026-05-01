import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  authCookieNames,
  createSessionCookie,
  exchangeDiscordCode,
  fetchDiscordUser,
  getCookieOptions,
  normalizeNextPath,
} from "../../../../../lib/auth-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(authCookieNames.state)?.value;
  const nextPath = normalizeNextPath(cookieStore.get(authCookieNames.next)?.value);
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  function fail(reason: string) {
    const response = NextResponse.redirect(
      new URL(`/login?error=${reason}&next=${encodeURIComponent(nextPath)}`, url),
    );

    response.cookies.set(authCookieNames.state, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(authCookieNames.next, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });

    return response;
  }

  if (error) {
    return fail("cancelled");
  }

  if (!expectedState || !state || expectedState !== state || !code) {
    return fail("invalid_state");
  }

  try {
    const token = await exchangeDiscordCode(code, url.origin);
    const session = await fetchDiscordUser(token.access_token);
    const response = NextResponse.redirect(new URL(nextPath, url));

    response.cookies.set(authCookieNames.session, createSessionCookie(session), {
      ...getCookieOptions(),
      maxAge: 60 * 60 * 24 * 14,
    });
    response.cookies.set(authCookieNames.state, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(authCookieNames.next, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });

    return response;
  } catch {
    return fail("session_failed");
  }
}
