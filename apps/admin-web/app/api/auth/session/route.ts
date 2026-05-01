import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieNames, readSessionCookie } from "../../../../lib/auth-session";

export async function GET() {
  const cookieStore = await cookies();
  const session = readSessionCookie(cookieStore.get(authCookieNames.session)?.value);

  if (!session) {
    return NextResponse.json({ session: null });
  }

  const backendUrl = process.env.NEXT_PUBLIC_KOVA_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({
      session: {
        ...session,
        accessLevel: "none",
      },
    });
  }

  try {
    const response = await fetch(`${backendUrl}/auth/session`, {
      headers: {
        "x-discord-user-id": session.discordId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to resolve backend session.");
    }

    const data = (await response.json()) as {
      actor?: {
        accessLevel?: "none" | "mod" | "admin" | "full";
      };
    };

    return NextResponse.json({
      session: {
        ...session,
        accessLevel: data.actor?.accessLevel ?? "none",
      },
    });
  } catch {
    return NextResponse.json({
      session: {
        ...session,
        accessLevel: "none",
      },
    });
  }
}
