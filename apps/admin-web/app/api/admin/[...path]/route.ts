import { NextRequest, NextResponse } from "next/server";
import { authCookieNames, readSessionCookie } from "../../../../lib/auth-session";

function getBackendUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_KOVA_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_KOVA_BACKEND_URL is not configured.");
  }

  return backendUrl.replace(/\/$/, "");
}

async function proxyAdminRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const session = readSessionCookie(request.cookies.get(authCookieNames.session)?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path = [] } = await context.params;
  const backendPath = path.join("/");
  const targetUrl = `${getBackendUrl()}/${backendPath}${request.nextUrl.search}`;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      "content-type": "application/json",
      "x-discord-user-id": session.discordId,
    },
    body:
      request.method === "GET" || request.method === "HEAD"
        ? null
        : await request.text(),
    cache: "no-store",
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAdminRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAdminRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAdminRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAdminRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxyAdminRequest(request, context);
}
