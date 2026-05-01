import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify, { type FastifyInstance } from "fastify";
import { loadBackendEnv } from "@kova/config";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerProfileRoutes } from "./routes/profiles.js";
import { registerApplicationRoutes } from "./routes/applications.js";
import { registerAccessRoutes } from "./routes/access.js";
import { registerVerificationRoutes } from "./routes/verification.js";
import { registerInternalRoutes } from "./routes/internal.js";
import { registerWebsiteRoutes } from "./routes/website.js";
import { registerValorantSystemRoutes } from "./routes/valorant-system.js";
import { registerValorantRiotRoutes } from "./routes/valorant-riot.js";

export function buildApp(): FastifyInstance {
  const env = loadBackendEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  app.decorate("appEnv", env);

  void app.register(sensible);
  void app.register(cors, {
    origin: true,
    credentials: true,
  });

  void app.register(registerHealthRoutes, { prefix: "/health" });
  void app.register(registerAuthRoutes, { prefix: "/auth" });
  void app.register(registerProfileRoutes, { prefix: "/profiles" });
  void app.register(registerApplicationRoutes, { prefix: "/applications" });
  void app.register(registerAccessRoutes, { prefix: "/access" });
  void app.register(registerVerificationRoutes, { prefix: "/verification" });
  void app.register(registerInternalRoutes, { prefix: "/internal" });
  void app.register(registerWebsiteRoutes, { prefix: "/website" });
  void app.register(registerValorantSystemRoutes, { prefix: "/valorant-system" });
  void app.register(registerValorantRiotRoutes, { prefix: "/valorant-riot" });

  return app;
}
