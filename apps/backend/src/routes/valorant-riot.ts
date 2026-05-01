import type { FastifyInstance } from "fastify";
import { requireAdminAccess } from "../auth/guards.js";
import {
  valorantAccountUpsertSchema,
  valorantMatchIngestSchema,
  valorantRiotSyncRequestSchema,
} from "../schemas/valorant-riot.js";
import {
  fetchRecentValorantMatchesForDiscordId,
  getValorantAccountByDiscordId,
  listValorantAggregatesForDiscordId,
  ingestValorantMatchForDiscordId,
  getValorantMatchAcceptanceRules,
  getValorantSyncPolicyForDiscordId,
  listSupportedLeaderboardScopes,
  recomputeValorantAggregatesForDiscordId,
  scheduleValorantAccountSync,
  upsertValorantAccountForDiscordId,
} from "../services/valorant-riot.service.js";

export async function registerValorantRiotRoutes(app: FastifyInstance) {
  app.get("/status", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    return {
      status: "scaffolded",
      scopes: listSupportedLeaderboardScopes(),
      rules: getValorantMatchAcceptanceRules(),
    };
  });

  app.get("/policy/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const policy = await getValorantSyncPolicyForDiscordId(discordId);

    return { policy };
  });

  app.get("/account/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const account = await getValorantAccountByDiscordId(discordId);

    return { account };
  });

  app.get("/aggregates/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const items = await listValorantAggregatesForDiscordId(discordId);

    return { items };
  });

  app.get("/history/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const query = request.query as { limit?: string };
    const limit = query.limit ? Number.parseInt(query.limit, 10) : 5;
    const result = await fetchRecentValorantMatchesForDiscordId({
      discordId,
      limit: Number.isFinite(limit) ? limit : 5,
    });

    return { result };
  });

  app.put("/account/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const parseBody = valorantAccountUpsertSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant account payload",
        issues: parseBody.error.flatten(),
      });
    }

    const result = await upsertValorantAccountForDiscordId({
      discordId,
      reviewerDiscordId: actor.discordId,
      account: parseBody.data,
    });

    return { result };
  });

  app.post("/ingest/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const parseBody = valorantMatchIngestSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant match ingest payload",
        issues: parseBody.error.flatten(),
      });
    }

    const result = await ingestValorantMatchForDiscordId({
      discordId,
      reviewerDiscordId: actor.discordId,
      payload: parseBody.data,
    });

    return { result };
  });

  app.post("/sync/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const parseBody = valorantRiotSyncRequestSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid Valorant Riot sync payload",
        issues: parseBody.error.flatten(),
      });
    }

    const job = await scheduleValorantAccountSync({
      discordId,
      triggeredBy: "admin",
      mode: parseBody.data.mode,
    });

    return { job };
  });

  app.post("/recompute/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const result = await recomputeValorantAggregatesForDiscordId(discordId);

    return { result };
  });
}
