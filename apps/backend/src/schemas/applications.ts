import { z } from "zod";
import { applicationCategories } from "@kova/shared";

export const applicationSubmissionSchema = z.object({
  category: z.enum(applicationCategories),
  subtype: z.string().min(1),
  title: z.string().min(1).max(120),
  submission: z.record(z.string(), z.unknown()),
});

export type ApplicationSubmissionInput = z.infer<
  typeof applicationSubmissionSchema
>;

export const applicationReviewUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  archived: z.boolean().optional(),
  internalNotes: z.string().max(5000).nullable().optional(),
});

export type ApplicationReviewUpdateInput = z.infer<
  typeof applicationReviewUpdateSchema
>;
