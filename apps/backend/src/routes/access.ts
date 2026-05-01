import type { FastifyInstance } from "fastify";
import { requireAdminAccess, requireFullAccess } from "../auth/guards.js";
import { accessAssignmentSchema } from "../schemas/access.js";
import {
  assignAccessByDiscordId,
  getAccessByDiscordId,
  listAccessAssignments,
} from "../services/access.service.js";

export async function registerAccessRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const items = await listAccessAssignments();

    return {
      items,
    };
  });

  app.get("/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const result = await getAccessByDiscordId(discordId);

    return {
      user: result.user,
      access: result.access,
      level: result.level,
    };
  });

  app.post("/", async (request, reply) => {
    const actor = await requireFullAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseResult = accessAssignmentSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid access assignment payload",
        issues: parseResult.error.flatten(),
      });
    }

    const result = await assignAccessByDiscordId({
      targetDiscordId: parseResult.data.discordId,
      level: parseResult.data.level,
      assignedByDiscordId: actor.discordId,
    });

    return reply.code(201).send({
      user: result.user,
      access: result.access,
      level: result.level,
    });
  });
}
