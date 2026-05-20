import type { FastifyRequest } from "fastify";
import type { AccessLevel } from "@kova/shared";
import { getAccessLevelByDiscordId } from "../services/access.service.js";

export interface RequestActor {
  discordId: string | null;
  accessLevel: AccessLevel;
  isInternal: boolean;
}

export async function getRequestActor(request: FastifyRequest): Promise<RequestActor> {
  const discordIdHeader = request.headers["x-discord-user-id"];
  const internalTokenHeader = request.headers["x-internal-api-token"];
  const proxyTokenHeader = request.headers["x-kova-proxy-token"];

  const isInternal =
    typeof internalTokenHeader === "string" &&
    internalTokenHeader === request.server.appEnv.INTERNAL_API_TOKEN;
  const isTrustedProxy =
    typeof proxyTokenHeader === "string" &&
    request.server.appEnv.KOVA_BACKEND_PROXY_TOKEN !== null &&
    proxyTokenHeader === request.server.appEnv.KOVA_BACKEND_PROXY_TOKEN;
  const allowLocalUnsignedIdentity =
    request.server.appEnv.NODE_ENV !== "production" &&
    request.server.appEnv.KOVA_BACKEND_PROXY_TOKEN === null;

  const canTrustDiscordHeader = isInternal || isTrustedProxy || allowLocalUnsignedIdentity;
  const discordId =
    canTrustDiscordHeader &&
    typeof discordIdHeader === "string" &&
    discordIdHeader.trim().length > 0
      ? discordIdHeader.trim()
      : null;

  const accessLevel =
    discordId && !isInternal
      ? await getAccessLevelByDiscordId(discordId)
      : "none";

  return {
    discordId,
    accessLevel,
    isInternal,
  };
}
