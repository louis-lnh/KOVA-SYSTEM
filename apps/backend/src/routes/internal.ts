import type { FastifyInstance } from "fastify";
import { requireInternalAccess } from "../auth/guards.js";
import {
  listPendingNotifications,
  markNotificationSent,
} from "../services/notifications.service.js";

export async function registerInternalRoutes(app: FastifyInstance) {
  app.get("/ping", async (request, reply) => {
    const actor = await requireInternalAccess(request, reply);

    if (!actor) {
      return;
    }

    return {
      ok: true,
      scope: "internal",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/notifications/pending", async (request, reply) => {
    const actor = await requireInternalAccess(request, reply);

    if (!actor) {
      return;
    }

    const query = request.query as { type?: string };
    const items = await listPendingNotifications(query.type);

    return {
      items,
    };
  });

  app.post("/notifications/:notificationId/sent", async (request, reply) => {
    const actor = await requireInternalAccess(request, reply);

    if (!actor) {
      return;
    }

    const { notificationId } = request.params as { notificationId: string };
    const item = await markNotificationSent(notificationId);

    return {
      item,
    };
  });
}
