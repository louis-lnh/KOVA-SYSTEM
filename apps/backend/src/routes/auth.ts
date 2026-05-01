import type { FastifyInstance } from "fastify";
import { getRequestActor } from "../auth/request-context.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get("/session", async (request) => {
    const actor = await getRequestActor(request);

    return {
      authenticated: Boolean(actor.discordId),
      actor,
      message: "Resolved request identity is active.",
    };
  });
}
