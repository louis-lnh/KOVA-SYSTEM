import type { FastifyInstance } from "fastify";
import { requireAdminAccess, requireAuthenticatedUser } from "../auth/guards.js";
import {
  applicationReviewUpdateSchema,
  applicationSubmissionSchema,
} from "../schemas/applications.js";
import {
  createApplicationForDiscordUser,
  getApplicationByIdForAdmin,
  getPremierEligibilityForDiscordUser,
  listApplicationsForDiscordUser,
  listApplicationsForAdmin,
  updateApplicationReview,
} from "../services/applications.service.js";

export async function registerApplicationRoutes(app: FastifyInstance) {
  app.get("/me", async (request, reply) => {
    const actor = await requireAuthenticatedUser(request, reply);

    if (!actor) {
      return;
    }

    const items = await listApplicationsForDiscordUser(actor.discordId);

    return {
      items,
    };
  });

  app.get("/premier-eligibility", async (request, reply) => {
    const actor = await requireAuthenticatedUser(request, reply);

    if (!actor) {
      return;
    }

    const result = await getPremierEligibilityForDiscordUser(actor.discordId);

    return result;
  });

  app.get("/", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const query = request.query as {
      category?:
        | "competitive"
        | "staff"
        | "community"
        | "creative"
        | "partnerships";
      status?: "pending" | "accepted" | "rejected";
      archived?: "true" | "false";
    };

    const filters: {
      category?:
        | "competitive"
        | "staff"
        | "community"
        | "creative"
        | "partnerships";
      status?: "pending" | "accepted" | "rejected";
      archived?: boolean;
    } = {};

    if (query.category) {
      filters.category = query.category;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.archived !== undefined) {
      filters.archived = query.archived === "true";
    }

    const items = await listApplicationsForAdmin(filters);

    return {
      items,
    };
  });

  app.post("/", async (request, reply) => {
    const actor = await requireAuthenticatedUser(request, reply);

    if (!actor) {
      return;
    }

    const parseResult = applicationSubmissionSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid application payload",
        issues: parseResult.error.flatten(),
      });
    }

    const application = await createApplicationForDiscordUser(
      actor.discordId,
      parseResult.data,
    );

    return reply.code(201).send({
      application,
    });
  });

  app.patch("/:applicationId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { applicationId } = request.params as { applicationId: string };
    const parseResult = applicationReviewUpdateSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({
        error: "Invalid application review payload",
        issues: parseResult.error.flatten(),
      });
    }

    const application = await updateApplicationReview({
      applicationId,
      reviewerDiscordId: actor.discordId,
      ...parseResult.data,
    });

    return {
      application,
    };
  });

  app.get("/:applicationId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { applicationId } = request.params as { applicationId: string };
    const application = await getApplicationByIdForAdmin(applicationId);

    if (!application) {
      return reply.code(404).send({
        error: "Application not found",
      });
    }

    return {
      application,
    };
  });
}
