import { prisma } from "@kova/database";
import type { ProfileUpsertInput } from "../schemas/profiles.js";
import { ensureUserByDiscordId } from "./users.service.js";

export async function getProfileByDiscordId(discordId: string) {
  const user = await prisma.user.findUnique({
    where: {
      discordId,
    },
    include: {
      profile: true,
    },
  });

  return {
    user,
    profile: user?.profile ?? null,
  };
}

export async function upsertProfileByDiscordId(
  discordId: string,
  input: ProfileUpsertInput,
) {
  const user = await ensureUserByDiscordId({
    discordId,
  });

  const profile = await prisma.userProfile.upsert({
    where: {
      userId: user.id,
    },
    update: {
      riotId: input.riotId,
      trackerUrl: input.trackerUrl,
      currentRank: input.currentRank,
      peakRank: input.peakRank,
      mainAgents: input.mainAgents,
      region: input.region,
      socialLinks: input.socialLinks,
    },
    create: {
      userId: user.id,
      riotId: input.riotId,
      trackerUrl: input.trackerUrl,
      currentRank: input.currentRank,
      peakRank: input.peakRank,
      mainAgents: input.mainAgents,
      region: input.region,
      socialLinks: input.socialLinks,
    },
  });

  return {
    user,
    profile,
  };
}

