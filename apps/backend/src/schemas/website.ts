import { z } from "zod";

export const websiteContentSectionSchema = z.enum([
  "landing",
  "about",
  "team",
  "members",
  "events",
  "legal",
]);

export const websiteContentSaveSchema = z.object({
  data: z.record(z.string(), z.string()),
});

export type WebsiteContentSection = z.infer<typeof websiteContentSectionSchema>;
export type WebsiteContentSaveInput = z.infer<typeof websiteContentSaveSchema>;

export const websiteEventCreateSchema = z.object({
  slug: z.string().min(1).max(80),
  category: z.enum(["premier", "tournament", "league", "manual"]),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(2000),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  visible: z.boolean().optional(),
  highlight: z.boolean().optional(),
  archived: z.boolean().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const websiteEventUpdateSchema = websiteEventCreateSchema.partial().extend({
  slug: z.string().min(1).max(80).optional(),
});

export type WebsiteEventCreateInput = z.infer<typeof websiteEventCreateSchema>;
export type WebsiteEventUpdateInput = z.infer<typeof websiteEventUpdateSchema>;
