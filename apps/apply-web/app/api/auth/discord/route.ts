import { NextResponse } from "next/server";
import {
  authCookieNames,
  buildDiscordAuthorizeUrl,
  createOAuthState,
  getCookieOptions,
  normalizeNextPath,
} from "../../../../lib/auth-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = normalizeNextPath(url.searchParams.get("next"));

  try {
    const state = createOAuthState();
    const response = NextResponse.redirect(
      buildDiscordAuthorizeUrl(url.origin, state),
    );

    response.cookies.set(authCookieNames.state, state, {
      ...getCookieOptions(),
      maxAge: 60 * 10,
    });
    response.cookies.set(authCookieNames.next, nextPath, {
      ...getCookieOptions(),
      maxAge: 60 * 10,
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL(`/login?error=unavailable&next=${encodeURIComponent(nextPath)}`, url),
    );
  }
}
