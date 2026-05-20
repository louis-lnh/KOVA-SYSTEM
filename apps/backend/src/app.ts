import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify, { type FastifyInstance } from "fastify";
import { loadBackendEnv } from "@kova/config";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerProfileRoutes } from "./routes/profiles.js";
import { registerApplicationRoutes } from "./routes/applications.js";
import { registerAccessRoutes } from "./routes/access.js";
import { registerAuditRoutes } from "./routes/audit.js";
import { registerVerificationRoutes } from "./routes/verification.js";
import { registerInternalRoutes } from "./routes/internal.js";
import { registerWebsiteRoutes } from "./routes/website.js";
import { registerTournamentRoutes } from "./routes/tournaments.js";
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
  registerErrorHandler(app);

  void app.register(sensible);
  void app.register(helmet, {
    contentSecurityPolicy: false,
  });
  void app.register(cors, {
    origin:
      env.NODE_ENV === "production"
        ? env.KOVA_CORS_ORIGINS.length > 0
          ? env.KOVA_CORS_ORIGINS
          : false
        : true,
    credentials: true,
  });
  void app.register(rateLimit, {
    global: true,
    max: env.NODE_ENV === "production" ? 300 : 1200,
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      const forwardedFor = request.headers["x-forwarded-for"];
      const firstForwardedFor =
        typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : null;

      return firstForwardedFor || request.ip;
    },
  });

  void app.register(registerHealthRoutes, { prefix: "/health" });
  void app.register(registerAuthRoutes, { prefix: "/auth" });
  void app.register(registerProfileRoutes, { prefix: "/profiles" });
  void app.register(registerApplicationRoutes, { prefix: "/applications" });
  void app.register(registerAccessRoutes, { prefix: "/access" });
  void app.register(registerAuditRoutes, { prefix: "/audit" });
  void app.register(registerVerificationRoutes, { prefix: "/verification" });
  void app.register(registerInternalRoutes, { prefix: "/internal" });
  void app.register(registerWebsiteRoutes, { prefix: "/website" });
  void app.register(registerTournamentRoutes, { prefix: "/tournaments" });
  void app.register(registerValorantSystemRoutes, { prefix: "/valorant-system" });
  void app.register(registerValorantRiotRoutes, { prefix: "/valorant-riot" });

  return app;
}
