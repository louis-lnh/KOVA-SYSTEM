import type { FastifyInstance } from "fastify";
import { requireAdminAccess } from "../auth/guards.js";
import { auditLogListQuerySchema } from "../schemas/audit.js";
import { getAuditTaxonomy, listAuditLogs } from "../services/audit.service.js";

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/categories", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    return {
      items: getAuditTaxonomy(),
    };
  });

  app.get("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parsed = auditLogListQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid audit log query",
        issues: parsed.error.flatten(),
      });
    }

    return listAuditLogs(parsed.data);
  });
}
