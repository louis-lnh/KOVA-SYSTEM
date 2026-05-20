import { z } from "zod";

const positiveIntQuerySchema = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => Number.parseInt(value, 10));

export const auditLogListQuerySchema = z.object({
  category: z.string().min(1).max(80).optional(),
  subtype: z.string().min(1).max(80).optional(),
  actorDiscordId: z.string().min(1).max(64).optional(),
  action: z.string().min(1).max(120).optional(),
  targetType: z.string().min(1).max(120).optional(),
  targetId: z.string().min(1).max(160).optional(),
  cursor: z.string().min(1).optional(),
  limit: positiveIntQuerySchema.optional(),
});

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;
