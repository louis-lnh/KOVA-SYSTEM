import { prisma } from "@kova/database";

export async function ensureUserByDiscordId(input: {
  discordId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}) {
  const existing = await prisma.user.findUnique({
    where: {
      discordId: input.discordId,
    },
  });

  if (existing) {
    return prisma.user.update({
      where: {
        id: existing.id,
      },
      data: {
        username: input.username ?? existing.username,
        displayName:
          input.displayName === undefined ? existing.displayName : input.displayName,
        avatarUrl: input.avatarUrl === undefined ? existing.avatarUrl : input.avatarUrl,
      },
    });
  }

  return prisma.user.create({
    data: {
      discordId: input.discordId,
      username: input.username ?? input.discordId,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
  });
}

export async function getUserByDiscordId(discordId: string) {
  return prisma.user.findUnique({
    where: {
      discordId,
    },
  });
}

