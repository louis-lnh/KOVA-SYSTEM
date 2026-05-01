import { prisma } from "@kova/database";
import { Prisma } from "@prisma/client";
import { getUserByDiscordId } from "./users.service.js";

export async function createAuditLog(input: {
  actorDiscordId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  const actor = input.actorDiscordId
    ? await getUserByDiscordId(input.actorDiscordId)
    : null;

  return prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
