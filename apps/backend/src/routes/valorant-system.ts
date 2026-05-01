import type { FastifyInstance } from "fastify";
import { requireAdminAccess } from "../auth/guards.js";
import {
  valorantMemberStateUpsertSchema,
  valorantSyncWindowCreateSchema,
  valorantSyncWindowUpdateSchema,
} from "../schemas/valorant-system.js";
import {
  createValorantSyncWindow,
  getValorantSystemConfig,
  listValorantMemberStates,
  listValorantSyncWindows,
  updateValorantSyncWindow,
  upsertValorantMemberState,
} from "../services/valorant-system.service.js";

export async function registerValorantSystemRoutes(app: FastifyInstance) {
  app.get("/config", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    return getValorantSystemConfig();
  });

  app.get("/member-states", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const items = await listValorantMemberStates();
    return { items };
  });

  app.put("/member-states/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const parseBody = valorantMemberStateUpsertSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant member state payload",
        issues: parseBody.error.flatten(),
      });
    }

    const state = await upsertValorantMemberState({
      discordId,
      reviewerDiscordId: actor.discordId ?? null,
      state: parseBody.data,
    });

    return { state };
  });

  app.get("/sync-windows", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const items = await listValorantSyncWindows();
    return { items };
  });

  app.post("/sync-windows", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseBody = valorantSyncWindowCreateSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant sync window payload",
        issues: parseBody.error.flatten(),
      });
    }

    const window = await createValorantSyncWindow({
      reviewerDiscordId: actor.discordId ?? null,
      window: parseBody.data,
    });

    return reply.code(201).send({ window });
  });

  app.patch("/sync-windows/:windowId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { windowId } = request.params as { windowId: string };
    const parseBody = valorantSyncWindowUpdateSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant sync window update payload",
        issues: parseBody.error.flatten(),
      });
    }

    const window = await updateValorantSyncWindow({
      windowId,
      reviewerDiscordId: actor.discordId ?? null,
      window: parseBody.data,
    });

    return { window };
  });
}
