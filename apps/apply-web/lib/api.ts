const backendUrl = process.env.NEXT_PUBLIC_KOVA_BACKEND_URL;

function getBackendUrl() {
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_KOVA_BACKEND_URL is not configured.");
  }

  return backendUrl;
}

export interface SessionIdentity {
  discordId: string;
  username: string;
  avatarUrl?: string | null;
}

export async function apiRequest<T>(
  path: string,
  identity: SessionIdentity,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-discord-user-id": identity.discordId,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
