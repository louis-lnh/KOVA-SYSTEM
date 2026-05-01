import type { FastifyInstance } from "fastify";
import {
  requireAdminAccess,
  requireInternalAccess,
} from "../auth/guards.js";
import {
  verificationDecisionSchema,
  verificationUpsertSchema,
} from "../schemas/verification.js";
import {
  applyVerificationDecision,
  getVerificationByDiscordId,
  listVerificationRecordsForAdmin,
  upsertVerificationRecord,
} from "../services/verification.service.js";

export async function registerVerificationRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const query = request.query as {
      status?:
        | "verified"
        | "review_required"
        | "denied_once"
        | "denied_twice"
        | "banned"
        | "bot_banned";
    };

    const records = await listVerificationRecordsForAdmin(
      query.status ? { status: query.status } : undefined,
    );

    return {
      items: records,
    };
  });

  app.get("/:discordId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const record = await getVerificationByDiscordId(discordId);

    return {
      record,
    };
  });

  app.get("/internal/:discordId", async (request, reply) => {
    const actor = await requireInternalAccess(request, reply);

    if (!actor) {
      return;
    }

    const { discordId } = request.params as { discordId: string };
    const record = await getVerificationByDiscordId(discordId);

    return {
      record,
    };
  });

  app.post("/internal/upsert", async (request, reply) => {
    const actor = await requireInternalAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseResult = verificationUpsertSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid verification upsert payload",
        issues: parseResult.error.flatten(),
      });
    }

    const record = await upsertVerificationRecord({
      actorDiscordId: null,
      payload: parseResult.data,
    });

    return reply.code(201).send({
      record,
    });
  });

  app.post("/decision", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseResult = verificationDecisionSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid verification decision payload",
        issues: parseResult.error.flatten(),
      });
    }

    const result = await applyVerificationDecision({
      actorDiscordId: actor.discordId,
      payload: parseResult.data,
    });

    return {
      record: result.record,
      effect: result.effect,
    };
  });
}
