import type { FastifyInstance } from "fastify";
import { requireAuthenticatedUser } from "../auth/guards.js";
import { profileUpsertSchema } from "../schemas/profiles.js";
import {
  getProfileByDiscordId,
  upsertProfileByDiscordId,
} from "../services/profiles.service.js";

export async function registerProfileRoutes(app: FastifyInstance) {
  app.get("/me", async (request, reply) => {
    const actor = await requireAuthenticatedUser(request, reply);

    if (!actor) {
      return;
    }

    const result = await getProfileByDiscordId(actor.discordId);

    return {
      user: result.user,
      profile: result.profile,
    };
  });

  app.post("/me", async (request, reply) => {
    const actor = await requireAuthenticatedUser(request, reply);

    if (!actor) {
      return;
    }

    const parseResult = profileUpsertSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid profile payload",
        issues: parseResult.error.flatten(),
      });
    }

    const result = await upsertProfileByDiscordId(actor.discordId, parseResult.data);

    return reply.code(201).send({
      user: result.user,
      profile: result.profile,
    });
  });
}
