import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

type InternalSession = {
  discordId: string;
  username: string;
  avatarUrl: string | null;
  issuedAt: number;
  expiresAt: number;
};

type DiscordTokenResponse = {
  access_token: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export type PublicSession = {
  discordId: string;
  username: string;
  avatarUrl: string | null;
};

export const authCookieNames = {
  session: "kova_apply_session",
  state: "kova_apply_auth_state",
  next: "kova_apply_auth_next",
} as const;

const sessionTtlMs = 1000 * 60 * 60 * 24 * 14;

function getAuthSecret() {
  const secret = process.env.KOVA_AUTH_SECRET;

  if (!secret) {
    throw new Error("KOVA_AUTH_SECRET is not configured.");
  }

  return secret;
}

function getDiscordClientId() {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    throw new Error("DISCORD_CLIENT_ID is not configured.");
  }

  return clientId;
}

function getDiscordClientSecret() {
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("DISCORD_CLIENT_SECRET is not configured.");
  }

  return clientSecret;
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function equalSignature(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createOAuthState() {
  return randomUUID();
}

export function isDiscordOAuthConfigured(source: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    source.DISCORD_CLIENT_ID &&
      source.DISCORD_CLIENT_SECRET &&
      source.KOVA_AUTH_SECRET,
  );
}

export function normalizeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function createSessionCookie(session: PublicSession) {
  const payload: InternalSession = {
    ...session,
    issuedAt: Date.now(),
    expiresAt: Date.now() + sessionTtlMs,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readSessionCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);

  if (!equalSignature(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as InternalSession;

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return {
      discordId: payload.discordId,
      username: payload.username,
      avatarUrl: payload.avatarUrl,
    } satisfies PublicSession;
  } catch {
    return null;
  }
}

export function buildDiscordAuthorizeUrl(origin: string, state: string) {
  const url = new URL("https://discord.com/oauth2/authorize");

  url.searchParams.set("client_id", getDiscordClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}/api/auth/discord/callback`);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeDiscordCode(code: string, origin: string) {
  const body = new URLSearchParams({
    client_id: getDiscordClientId(),
    client_secret: getDiscordClientSecret(),
    grant_type: "authorization_code",
    code,
    redirect_uri: `${origin}/api/auth/discord/callback`,
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Discord code.");
  }

  return (await response.json()) as DiscordTokenResponse;
}

export async function fetchDiscordUser(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Discord user.");
  }

  const data = (await response.json()) as DiscordUserResponse;

  return {
    discordId: data.id,
    username: data.global_name ?? data.username,
    avatarUrl: data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
      : null,
  } satisfies PublicSession;
}
