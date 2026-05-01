import { botEnv } from "../config.js";

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { internal?: boolean },
): Promise<T> {
  const response = await fetch(`${botEnv.KOVA_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(options?.internal
        ? { "x-internal-api-token": botEnv.INTERNAL_API_TOKEN }
        : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export interface VerificationDecisionResponse {
  record: {
    id: string;
    discordId: string;
    status: string;
    denyCount: number;
    reviewReason: string | null;
  };
  effect: string;
}

export interface VerificationRecordResponse {
  record: {
    id: string;
    discordId: string;
    status: string;
    denyCount: number;
    reviewReason: string | null;
  } | null;
}

export interface AccessAssignmentResponse {
  level: string;
}

export interface AccessLookupResponse {
  user: {
    discordId: string;
    username: string;
    displayName?: string | null;
  } | null;
  level: string;
}

export interface VerificationUpsertResponse {
  record: {
    id: string;
    discordId: string;
    status: string;
    denyCount: number;
    reviewReason: string | null;
  };
}

export interface PendingNotificationResponse {
  items: Array<{
    id: string;
    type: string;
    targetChannel: string;
    payload: Record<string, unknown>;
    createdAt: string;
    scheduledFor: string | null;
  }>;
}

export interface ActorSessionResponse {
  authenticated: boolean;
  actor: {
    discordId: string | null;
    accessLevel: "none" | "mod" | "admin" | "full";
    isInternal: boolean;
  };
  message: string;
}

export async function getActorSession(actorDiscordId: string) {
  return request<ActorSessionResponse>("/auth/session", {
    headers: {
      "x-discord-user-id": actorDiscordId,
    },
  });
}

export async function getVerificationRecord(discordId: string, actorDiscordId: string) {
  return request<VerificationRecordResponse>(`/verification/${discordId}`, {
    headers: {
      "x-discord-user-id": actorDiscordId,
    },
  });
}

export async function getVerificationRecordInternal(discordId: string) {
  return request<VerificationRecordResponse>(
    `/verification/internal/${discordId}`,
    undefined,
    { internal: true },
  );
}

export async function decideVerification(input: {
  actorDiscordId: string;
  discordId: string;
  decision: "approve" | "deny";
  reason?: string | null;
}) {
  return request<VerificationDecisionResponse>("/verification/decision", {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "x-discord-user-id": input.actorDiscordId,
    },
  });
}

export async function upsertVerificationRecord(input: {
  discordId: string;
  status:
    | "verified"
    | "review_required"
    | "denied_once"
    | "denied_twice"
    | "banned"
    | "bot_banned";
  reviewReason?: string | null;
  denyCount?: number;
  verifiedBy?: "system" | "staff" | null;
}) {
  return request<VerificationUpsertResponse>("/verification/internal/upsert", {
    method: "POST",
    body: JSON.stringify(input),
  }, { internal: true });
}

export async function assignAccess(input: {
  actorDiscordId: string;
  discordId: string;
  level: "mod" | "admin" | "full" | "none";
}) {
  return request<AccessAssignmentResponse>("/access", {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "x-discord-user-id": input.actorDiscordId,
    },
  });
}

export async function getAccessForDiscordId(
  discordId: string,
  actorDiscordId: string,
) {
  return request<AccessLookupResponse>(`/access/${discordId}`, {
    headers: {
      "x-discord-user-id": actorDiscordId,
    },
  });
}

export async function getPendingNotifications(type?: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return request<PendingNotificationResponse>(
    `/internal/notifications/pending${query}`,
    undefined,
    { internal: true },
  );
}

export async function markNotificationSent(notificationId: string) {
  return request<{ item: { id: string; sentAt: string } }>(
    `/internal/notifications/${notificationId}/sent`,
    {
      method: "POST",
    },
    { internal: true },
  );
}
