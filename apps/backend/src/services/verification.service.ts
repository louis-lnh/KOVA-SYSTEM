import { prisma } from "@kova/database";
import type { VerificationStatus } from "@kova/shared";
import { Prisma } from "@prisma/client";
import type {
  VerificationDecisionInput,
  VerificationUpsertInput,
} from "../schemas/verification.js";
import { createAuditLog } from "./audit.service.js";
import { ensureUserByDiscordId, getUserByDiscordId } from "./users.service.js";

export async function getVerificationByDiscordId(discordId: string) {
  const record = await prisma.verificationRecord.findUnique({
    where: {
      discordId,
    },
    include: {
      user: true,
    },
  });

  return record;
}

export async function listVerificationRecordsForAdmin(filters?: {
  status?: VerificationStatus;
}) {
  const where: Prisma.VerificationRecordWhereInput = {};

  if (filters?.status) {
    where.status = mapVerificationStatusToPrisma(filters.status);
  }

  return prisma.verificationRecord.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        discordId: "asc",
      },
    ],
  });
}

export async function upsertVerificationRecord(input: {
  actorDiscordId: string | null;
  payload: VerificationUpsertInput;
}) {
  const user = await ensureUserByDiscordId({
    discordId: input.payload.discordId,
  });

  const updateData: Prisma.VerificationRecordUpdateInput = {
    user: {
      connect: {
        id: user.id,
      },
    },
    status: mapVerificationStatusToPrisma(input.payload.status),
  };

  if (input.payload.reviewReason !== undefined) {
    updateData.reviewReason = input.payload.reviewReason;
  }

  if (input.payload.denyCount !== undefined) {
    updateData.denyCount = input.payload.denyCount;
  }

  if (input.payload.status === "verified") {
    updateData.verifiedAt = new Date();
  }

  if (input.payload.verifiedBy !== undefined) {
    updateData.verifiedBy = input.payload.verifiedBy;
  }

  const record = await prisma.verificationRecord.upsert({
    where: {
      discordId: input.payload.discordId,
    },
    update: updateData,
    create: {
      userId: user.id,
      discordId: input.payload.discordId,
      status: mapVerificationStatusToPrisma(input.payload.status),
      reviewReason: input.payload.reviewReason ?? null,
      denyCount: input.payload.denyCount ?? 0,
      verifiedAt: input.payload.status === "verified" ? new Date() : null,
      verifiedBy: input.payload.verifiedBy ?? null,
    },
    include: {
      user: true,
    },
  });

  await createAuditLog({
    actorDiscordId: input.actorDiscordId,
    action: "verification.upserted",
    targetType: "verification_record",
    targetId: record.id,
    metadata: {
      discordId: input.payload.discordId,
      status: input.payload.status,
    },
  });

  return record;
}

export async function applyVerificationDecision(input: {
  actorDiscordId: string | null;
  payload: VerificationDecisionInput;
}) {
  const existing = await getVerificationByDiscordId(input.payload.discordId);
  const targetUser = await ensureUserByDiscordId({
    discordId: input.payload.discordId,
  });
  const actor = input.actorDiscordId
    ? await getUserByDiscordId(input.actorDiscordId)
    : null;

  const nextState = deriveDecisionState({
    currentStatus: mapVerificationStatusFromPrisma(existing?.status),
    currentDenyCount: existing?.denyCount ?? 0,
    decision: input.payload.decision,
    reason: input.payload.reason ?? null,
  });

  const record = await prisma.verificationRecord.upsert({
    where: {
      discordId: input.payload.discordId,
    },
    update: {
      userId: targetUser.id,
      status: mapVerificationStatusToPrisma(nextState.status),
      reviewReason: nextState.reviewReason,
      denyCount: nextState.denyCount,
      verifiedAt: nextState.status === "verified" ? new Date() : null,
      verifiedBy: nextState.status === "verified" ? "staff" : null,
    },
    create: {
      userId: targetUser.id,
      discordId: input.payload.discordId,
      status: mapVerificationStatusToPrisma(nextState.status),
      reviewReason: nextState.reviewReason,
      denyCount: nextState.denyCount,
      verifiedAt: nextState.status === "verified" ? new Date() : null,
      verifiedBy: nextState.status === "verified" ? "staff" : null,
    },
    include: {
      user: true,
    },
  });

  await createAuditLog({
    actorDiscordId: actor?.discordId ?? null,
    action: `verification.${input.payload.decision}`,
    targetType: "verification_record",
    targetId: record.id,
    metadata: {
      discordId: input.payload.discordId,
      status: nextState.status,
      denyCount: nextState.denyCount,
      reason: nextState.reviewReason,
    },
  });

  return {
    record,
    effect: nextState.effect,
  };
}

function deriveDecisionState(input: {
  currentStatus: VerificationStatus | null;
  currentDenyCount: number;
  decision: "approve" | "deny";
  reason: string | null;
}) {
  if (input.decision === "approve") {
    return {
      status: "verified" as const,
      denyCount: input.currentDenyCount,
      reviewReason: null,
      effect: "approved",
    };
  }

  const nextDenyCount = Math.min(input.currentDenyCount + 1, 2);

  return {
    status: nextDenyCount >= 2 ? ("denied_twice" as const) : ("denied_once" as const),
    denyCount: nextDenyCount,
    reviewReason: input.reason,
    effect: nextDenyCount >= 2 ? "ban" : "kick",
  };
}

function mapVerificationStatusToPrisma(
  status: VerificationStatus,
):
  | "VERIFIED"
  | "REVIEW_REQUIRED"
  | "DENIED_ONCE"
  | "DENIED_TWICE"
  | "BANNED"
  | "BOT_BANNED" {
  switch (status) {
    case "review_required":
      return "REVIEW_REQUIRED";
    case "denied_once":
      return "DENIED_ONCE";
    case "denied_twice":
      return "DENIED_TWICE";
    case "banned":
      return "BANNED";
    case "bot_banned":
      return "BOT_BANNED";
    default:
      return "VERIFIED";
  }
}

function mapVerificationStatusFromPrisma(
  status:
    | "VERIFIED"
    | "REVIEW_REQUIRED"
    | "DENIED_ONCE"
    | "DENIED_TWICE"
    | "BANNED"
    | "BOT_BANNED"
    | undefined,
): VerificationStatus | null {
  switch (status) {
    case "REVIEW_REQUIRED":
      return "review_required";
    case "DENIED_ONCE":
      return "denied_once";
    case "DENIED_TWICE":
      return "denied_twice";
    case "BANNED":
      return "banned";
    case "BOT_BANNED":
      return "bot_banned";
    case "VERIFIED":
      return "verified";
    default:
      return null;
  }
}
