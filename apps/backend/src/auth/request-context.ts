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

  const discordId =
    typeof discordIdHeader === "string" && discordIdHeader.trim().length > 0
      ? discordIdHeader.trim()
      : null;

  const isInternal =
    typeof internalTokenHeader === "string" &&
    internalTokenHeader === request.server.appEnv.INTERNAL_API_TOKEN;

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
