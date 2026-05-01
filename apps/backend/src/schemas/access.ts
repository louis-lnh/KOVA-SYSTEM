import { z } from "zod";
import { accessLevels } from "@kova/shared";

export const accessAssignmentSchema = z.object({
  discordId: z.string().trim().min(1).max(64),
  level: z.enum(accessLevels),
});

export type AccessAssignmentInput = z.infer<typeof accessAssignmentSchema>;

