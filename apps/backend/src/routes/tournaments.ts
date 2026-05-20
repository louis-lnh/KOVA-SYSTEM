import type { FastifyInstance } from "fastify";
import { requireAdminAccess } from "../auth/guards.js";
import {
  tournamentAnnouncementSchema,
  tournamentCreateSchema,
  tournamentUpdateSchema,
} from "../schemas/tournaments.js";
import {
  createTournament,
  deleteTournament,
  listTournaments,
  sendTournamentAnnouncement,
  updateTournament,
} from "../services/tournaments.service.js";

export async function registerTournamentRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const items = await listTournaments();
    return { items };
  });

  app.post("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parsed = tournamentCreateSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid tournament payload",
        issues: parsed.error.flatten(),
      });
    }

    const tournament = await createTournament({
      actorDiscordId: actor.discordId ?? null,
      tournament: parsed.data,
    });

    return reply.code(201).send({ tournament });
  });

  app.patch("/:tournamentId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const parsed = tournamentUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid tournament update payload",
        issues: parsed.error.flatten(),
      });
    }

    const tournament = await updateTournament({
      tournamentId,
      actorDiscordId: actor.discordId ?? null,
      tournament: parsed.data,
    });

    return { tournament };
  });

  app.delete("/:tournamentId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    await deleteTournament({
      tournamentId,
      actorDiscordId: actor.discordId ?? null,
    });

    return reply.code(204).send();
  });

  app.post("/:tournamentId/announce", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { tournamentId } = request.params as { tournamentId: string };
    const parsed = tournamentAnnouncementSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid tournament announcement payload",
        issues: parsed.error.flatten(),
      });
    }

    const result = await sendTournamentAnnouncement({
      tournamentId,
      actorDiscordId: actor.discordId ?? null,
      announcement: parsed.data,
    });

    return reply.code(201).send(result);
  });
}
