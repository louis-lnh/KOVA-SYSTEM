import { prisma } from "@kova/database";
import type { AccessLevel } from "@kova/shared";
import { ensureUserByDiscordId, getUserByDiscordId } from "./users.service.js";

export async function getAccessByDiscordId(discordId: string) {
  const user = await prisma.user.findUnique({
    where: {
      discordId,
    },
    include: {
      access: true,
    },
  });

  return {
    user,
    access: user?.access ?? null,
    level: mapAccessLevel(user?.access?.level),
  };
}

export async function getAccessLevelByDiscordId(discordId: string) {
  const result = await getAccessByDiscordId(discordId);
  return result.level;
}

export async function assignAccessByDiscordId(input: {
  targetDiscordId: string;
  level: AccessLevel;
  assignedByDiscordId: string | null;
}) {
  const targetUser = await ensureUserByDiscordId({
    discordId: input.targetDiscordId,
  });

  const assignedByUser = input.assignedByDiscordId
    ? await getUserByDiscordId(input.assignedByDiscordId)
    : null;

  const level = mapAccessLevelToPrisma(input.level);

  const access = await prisma.accessAssignment.upsert({
    where: {
      userId: targetUser.id,
    },
    update: {
      level,
      assignedByUserId: assignedByUser?.id ?? null,
      assignedAt: new Date(),
    },
    create: {
      userId: targetUser.id,
      level,
      assignedByUserId: assignedByUser?.id ?? null,
    },
  });

  return {
    user: targetUser,
    access,
    level: mapAccessLevel(access.level),
  };
}

export async function listAccessAssignments() {
  const items = await prisma.accessAssignment.findMany({
    include: {
      user: true,
    },
    orderBy: [
      {
        level: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });

  return items.map((item) => ({
    id: item.id,
    level: mapAccessLevel(item.level),
    assignedAt: item.assignedAt,
    updatedAt: item.updatedAt,
    user: {
      id: item.user.id,
      discordId: item.user.discordId,
      username: item.user.username,
      displayName: item.user.displayName,
      avatarUrl: item.user.avatarUrl,
    },
  }));
}

function mapAccessLevel(
  level:
    | "NONE"
    | "MOD"
    | "ADMIN"
    | "FULL"
    | null
    | undefined,
): AccessLevel {
  switch (level) {
    case "MOD":
      return "mod";
    case "ADMIN":
      return "admin";
    case "FULL":
      return "full";
    default:
      return "none";
  }
}

function mapAccessLevelToPrisma(level: AccessLevel): "NONE" | "MOD" | "ADMIN" | "FULL" {
  switch (level) {
    case "mod":
      return "MOD";
    case "admin":
      return "ADMIN";
    case "full":
      return "FULL";
    default:
      return "NONE";
  }
}
