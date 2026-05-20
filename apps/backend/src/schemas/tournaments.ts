import { z } from "zod";

export const tournamentStatusSchema = z.enum([
  "draft",
  "upcoming",
  "live",
  "closed",
  "cancelled",
]);

export const tournamentMetadataSchema = z.object({
  publicDetails: z.string().max(4000).optional(),
  format: z.string().max(200).optional(),
  eventLabel: z.string().max(200).optional(),
  participationNote: z.string().max(500).optional(),
  registrationUrl: z.string().url().optional().or(z.literal("")),
  bracketUrl: z.string().url().optional().or(z.literal("")),
  streamUrl: z.string().url().optional().or(z.literal("")),
  prizePool: z.string().max(200).optional(),
});

export const tournamentCreateSchema = z.object({
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  status: tournamentStatusSchema,
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  metadata: tournamentMetadataSchema.optional(),
});

export const tournamentUpdateSchema = tournamentCreateSchema.partial().extend({
  slug: z.string().min(1).max(80).optional(),
});

export const tournamentAnnouncementSchema = z.object({
  overrideMessage: z.string().min(1).max(2000).optional(),
});

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>;
export type TournamentUpdateInput = z.infer<typeof tournamentUpdateSchema>;
export type TournamentAnnouncementInput = z.infer<typeof tournamentAnnouncementSchema>;
