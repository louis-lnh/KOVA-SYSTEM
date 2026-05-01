import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      ok: true,
      service: "kova-backend",
      timestamp: new Date().toISOString(),
    };
  });
}

