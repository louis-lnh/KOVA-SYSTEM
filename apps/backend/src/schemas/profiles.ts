import { z } from "zod";

export const profileUpsertSchema = z.object({
  riotId: z.string().trim().min(1).max(64).nullable(),
  trackerUrl: z.string().trim().url().nullable(),
  currentRank: z.string().trim().min(1).max(64).nullable(),
  peakRank: z.string().trim().min(1).max(64).nullable(),
  mainAgents: z.array(z.string().trim().min(1).max(32)).max(5),
  region: z.string().trim().min(1).max(32).nullable(),
  socialLinks: z.array(z.string().trim().url()).max(10),
});

export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;

