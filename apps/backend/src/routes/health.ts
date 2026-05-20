import type { FastifyInstance } from "fastify";
import { prisma } from "@kova/database";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      ok: true,
      service: "kova-backend",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/ready", async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        ok: true,
        service: "kova-backend",
        database: "reachable",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      request.log.error({ err: error }, "Database readiness check failed");

      return reply.code(503).send({
        ok: false,
        service: "kova-backend",
        database: "unreachable",
        timestamp: new Date().toISOString(),
      });
    }
  });
}
