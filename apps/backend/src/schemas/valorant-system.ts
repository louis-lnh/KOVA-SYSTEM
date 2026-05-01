import { z } from "zod";

export const valorantMemberStateUpsertSchema = z.object({
  teamAssignment: z.enum(["none", "main", "academy"]).default("none"),
  tournamentEligible: z.boolean().optional(),
  tournamentActive: z.boolean().optional(),
  premierActive: z.boolean().optional(),
  leagueActive: z.boolean().optional(),
  trackRanked: z.boolean().optional(),
  trackPremier: z.boolean().optional(),
  trackLeague: z.boolean().optional(),
  trackTournament: z.boolean().optional(),
  trackCustoms: z.boolean().optional(),
  customCaptureMode: z.enum(["off", "whitelisted_windows", "always"]).optional(),
  statusNote: z.string().max(2000).nullable().optional(),
});

export const valorantSyncWindowCreateSchema = z.object({
  discordId: z.string().min(1),
  label: z.string().min(1).max(120),
  sourceType: z.enum(["premier", "tournament", "league", "custom"]),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  enabled: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const valorantSyncWindowUpdateSchema = valorantSyncWindowCreateSchema
  .omit({ discordId: true })
  .partial();

export type ValorantMemberStateUpsertInput = z.infer<typeof valorantMemberStateUpsertSchema>;
export type ValorantSyncWindowCreateInput = z.infer<typeof valorantSyncWindowCreateSchema>;
export type ValorantSyncWindowUpdateInput = z.infer<typeof valorantSyncWindowUpdateSchema>;
