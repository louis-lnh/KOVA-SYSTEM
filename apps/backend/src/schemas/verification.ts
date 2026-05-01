import { z } from "zod";

export const verificationStatusSchema = z.enum([
  "verified",
  "review_required",
  "denied_once",
  "denied_twice",
  "banned",
  "bot_banned",
]);

export const verificationUpsertSchema = z.object({
  discordId: z.string().trim().min(1).max(64),
  status: verificationStatusSchema,
  reviewReason: z.string().max(500).nullable().optional(),
  denyCount: z.number().int().min(0).max(2).optional(),
  verifiedBy: z.enum(["system", "staff"]).nullable().optional(),
});

export const verificationDecisionSchema = z.object({
  discordId: z.string().trim().min(1).max(64),
  decision: z.enum(["approve", "deny"]),
  reason: z.string().max(500).nullable().optional(),
});

export type VerificationUpsertInput = z.infer<typeof verificationUpsertSchema>;
export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;

