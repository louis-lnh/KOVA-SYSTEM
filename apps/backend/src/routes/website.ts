import type { FastifyInstance } from "fastify";
import { requireAdminAccess } from "../auth/guards.js";
import {
  websiteContentSaveSchema,
  websiteContentSectionSchema,
  websiteEventCreateSchema,
  websiteEventUpdateSchema,
} from "../schemas/website.js";
import {
  createWebsiteEvent,
  deleteWebsiteEvent,
  getWebsiteContent,
  listWebsiteEvents,
  saveWebsiteContent,
  updateWebsiteEvent,
} from "../services/website.service.js";

export async function registerWebsiteRoutes(app: FastifyInstance) {
  app.get("/public/content/:section", async (request, reply) => {
    const parseSection = websiteContentSectionSchema.safeParse(
      (request.params as { section: string }).section,
    );

    if (!parseSection.success) {
      return reply.code(400).send({ error: "Invalid website section" });
    }

    const content = await getWebsiteContent(parseSection.data);

    return {
      content,
    };
  });

  app.get("/public/events", async () => {
    const items = await listWebsiteEvents();

    return {
      items: items.filter((item) => item.visible && !item.archived),
    };
  });

  app.get("/content/:section", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseSection = websiteContentSectionSchema.safeParse(
      (request.params as { section: string }).section,
    );

    if (!parseSection.success) {
      return reply.code(400).send({ error: "Invalid website section" });
    }

    const content = await getWebsiteContent(parseSection.data);

    return {
      content,
    };
  });

  app.put("/content/:section", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseSection = websiteContentSectionSchema.safeParse(
      (request.params as { section: string }).section,
    );
    const parseBody = websiteContentSaveSchema.safeParse(request.body);

    if (!parseSection.success) {
      return reply.code(400).send({ error: "Invalid website section" });
    }

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid website content payload",
        issues: parseBody.error.flatten(),
      });
    }

    const content = await saveWebsiteContent({
      section: parseSection.data,
      reviewerDiscordId: actor.discordId ?? null,
      content: parseBody.data,
    });

    return { content };
  });

  app.get("/events", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const items = await listWebsiteEvents();

    return { items };
  });

  app.post("/events", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const parseBody = websiteEventCreateSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid website event payload",
        issues: parseBody.error.flatten(),
      });
    }

    const event = await createWebsiteEvent({
      reviewerDiscordId: actor.discordId ?? null,
      event: parseBody.data,
    });

    return reply.code(201).send({ event });
  });

  app.patch("/events/:eventId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { eventId } = request.params as { eventId: string };
    const parseBody = websiteEventUpdateSchema.safeParse(request.body);

    if (!parseBody.success) {
      return reply.code(400).send({
        error: "Invalid website event update payload",
        issues: parseBody.error.flatten(),
      });
    }

    const event = await updateWebsiteEvent({
      eventId,
      reviewerDiscordId: actor.discordId ?? null,
      event: parseBody.data,
    });

    return { event };
  });

  app.delete("/events/:eventId", async (request, reply) => {
    const actor = await requireAdminAccess(request, reply);

    if (!actor) {
      return;
    }

    const { eventId } = request.params as { eventId: string };

    await deleteWebsiteEvent({
      eventId,
      reviewerDiscordId: actor.discordId ?? null,
    });

    return reply.code(204).send();
  });
}
