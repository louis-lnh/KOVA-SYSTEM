export type AccessLevel = "none" | "mod" | "admin" | "full";

export interface SessionIdentity {
  discordId: string;
  username: string;
  avatarUrl?: string | null;
  accessLevel: AccessLevel;
}

export async function adminApiRequest<T>(
  path: string,
  _identity: SessionIdentity,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
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
