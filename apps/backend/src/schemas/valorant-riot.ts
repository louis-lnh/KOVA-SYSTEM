import { z } from "zod";

export const valorantRiotSyncRequestSchema = z.object({
  mode: z.enum(["account_refresh", "recent_matches", "full_recompute"]),
});

export const valorantAccountUpsertSchema = z.object({
  riotGameName: z.string().min(1).max(64),
  riotTagLine: z.string().min(1).max(16),
  region: z.string().min(1).max(32),
  trackerUrl: z.string().url().nullable().optional(),
  puuid: z.string().min(1).max(128).nullable().optional(),
  syncEnabled: z.boolean().optional(),
});

const jsonRecordSchema = z.record(z.string(), z.unknown());

export const valorantMatchIngestSchema = z.object({
  match: z.object({
    riotMatchId: z.string().min(1).max(128),
    queue: z.string().min(1).max(64),
    queueMode: z.string().max(128).nullable().optional(),
    map: z.string().max(128).nullable().optional(),
    season: z.string().max(128).nullable().optional(),
    startedAt: z.string().datetime().nullable().optional(),
    rawPayload: jsonRecordSchema.nullable().optional(),
  }),
  player: z.object({
    agent: z.string().max(64).nullable().optional(),
    teamSide: z.string().max(32).nullable().optional(),
    won: z.boolean().nullable().optional(),
    kills: z.number().int().min(0).nullable().optional(),
    deaths: z.number().int().min(0).nullable().optional(),
    assists: z.number().int().min(0).nullable().optional(),
    headshots: z.number().int().min(0).nullable().optional(),
    bodyshots: z.number().int().min(0).nullable().optional(),
    legshots: z.number().int().min(0).nullable().optional(),
    acs: z.number().int().min(0).nullable().optional(),
    kast: z.number().min(0).max(100).nullable().optional(),
    damage: z.number().int().min(0).nullable().optional(),
    plants: z.number().int().min(0).nullable().optional(),
    defuses: z.number().int().min(0).nullable().optional(),
    firstBloods: z.number().int().min(0).nullable().optional(),
    firstDeaths: z.number().int().min(0).nullable().optional(),
    rawPayload: jsonRecordSchema.nullable().optional(),
  }),
});

export type ValorantRiotSyncRequestInput = z.infer<typeof valorantRiotSyncRequestSchema>;
export type ValorantAccountUpsertInput = z.infer<typeof valorantAccountUpsertSchema>;
export type ValorantMatchIngestInput = z.infer<typeof valorantMatchIngestSchema>;
