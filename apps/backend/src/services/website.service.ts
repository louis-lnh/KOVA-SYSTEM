import { prisma } from "@kova/database";
import { randomUUID } from "node:crypto";
import type {
  WebsiteContentSaveInput,
  WebsiteContentSection,
  WebsiteEventCreateInput,
  WebsiteEventUpdateInput,
} from "../schemas/website.js";
import { createAuditLog } from "./audit.service.js";
import { getUserByDiscordId } from "./users.service.js";

type WebsiteContentRow = {
  id: string;
  section: string;
  data: Record<string, string>;
  updatedAt: Date;
  updatedByUserId: string | null;
  updatedByUsername: string | null;
  updatedByDisplayName: string | null;
};

type WebsiteEventRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: Date | null;
  endsAt: Date | null;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  metadata: Record<string, string>;
  updatedAt: Date;
  updatedByUserId: string | null;
  updatedByUsername: string | null;
  updatedByDisplayName: string | null;
};

function mapWebsiteContentRow(row: WebsiteContentRow) {
  return {
    id: row.id,
    section: row.section,
    data: row.data,
    updatedAt: row.updatedAt,
    updatedByUser:
      row.updatedByUserId && row.updatedByUsername
        ? {
            username: row.updatedByUsername,
            displayName: row.updatedByDisplayName,
          }
        : null,
  };
}

function mapWebsiteEventRow(row: WebsiteEventRow) {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    summary: row.summary,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    visible: row.visible,
    highlight: row.highlight,
    archived: row.archived,
    metadata: row.metadata,
    updatedAt: row.updatedAt,
    updatedByUser:
      row.updatedByUserId && row.updatedByUsername
        ? {
            username: row.updatedByUsername,
            displayName: row.updatedByDisplayName,
          }
        : null,
  };
}

export async function getWebsiteContent(section: WebsiteContentSection) {
  const rows = await prisma.$queryRawUnsafe<WebsiteContentRow[]>(
    `
      SELECT
        wc."id",
        wc."section",
        wc."data",
        wc."updatedAt",
        wc."updatedByUserId",
        u."username" AS "updatedByUsername",
        u."displayName" AS "updatedByDisplayName"
      FROM "WebsiteContent" wc
      LEFT JOIN "User" u ON u."id" = wc."updatedByUserId"
      WHERE wc."section" = $1
      LIMIT 1
    `,
    section,
  );

  return rows[0] ? mapWebsiteContentRow(rows[0]) : null;
}

export async function saveWebsiteContent(input: {
  section: WebsiteContentSection;
  reviewerDiscordId: string | null;
  content: WebsiteContentSaveInput;
}) {
  const createdId = randomUUID();
  const user = input.reviewerDiscordId
    ? await getUserByDiscordId(input.reviewerDiscordId)
    : null;

  const rows = await prisma.$queryRawUnsafe<WebsiteContentRow[]>(
    `
      INSERT INTO "WebsiteContent" ("id", "section", "data", "updatedByUserId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3::jsonb, $4, NOW(), NOW())
      ON CONFLICT ("section")
      DO UPDATE SET
        "data" = EXCLUDED."data",
        "updatedByUserId" = EXCLUDED."updatedByUserId",
        "updatedAt" = NOW()
      RETURNING "id", "section", "data", "updatedAt", "updatedByUserId"
    `,
    createdId,
    input.section,
    JSON.stringify(input.content.data),
    user?.id ?? null,
  );

  const content = await getWebsiteContent(input.section);

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "website.content_saved",
    targetType: "website_content",
    targetId: rows[0]?.id ?? input.section,
    metadata: {
      section: input.section,
      keys: Object.keys(input.content.data),
    },
  });

  return content;
}

export async function listWebsiteEvents() {
  const rows = await prisma.$queryRawUnsafe<WebsiteEventRow[]>(
    `
      SELECT
        we."id",
        we."slug",
        we."category",
        we."title",
        we."summary",
        we."startsAt",
        we."endsAt",
        we."visible",
        we."highlight",
        we."archived",
        we."metadata",
        we."updatedAt",
        we."updatedByUserId",
        u."username" AS "updatedByUsername",
        u."displayName" AS "updatedByDisplayName"
      FROM "WebsiteEvent" we
      LEFT JOIN "User" u ON u."id" = we."updatedByUserId"
      ORDER BY we."startsAt" ASC NULLS LAST, we."createdAt" DESC
    `,
  );

  return rows.map(mapWebsiteEventRow);
}

export async function createWebsiteEvent(input: {
  reviewerDiscordId: string | null;
  event: WebsiteEventCreateInput;
}) {
  const createdId = randomUUID();
  const user = input.reviewerDiscordId
    ? await getUserByDiscordId(input.reviewerDiscordId)
    : null;

  const rows = await prisma.$queryRawUnsafe<WebsiteEventRow[]>(
    `
      INSERT INTO "WebsiteEvent" (
        "id",
        "slug",
        "category",
        "title",
        "summary",
        "startsAt",
        "endsAt",
        "visible",
        "highlight",
        "archived",
        "metadata",
        "updatedByUserId",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, NOW(), NOW())
      RETURNING
        "id",
        "slug",
        "category",
        "title",
        "summary",
        "startsAt",
        "endsAt",
        "visible",
        "highlight",
        "archived",
        "metadata",
        "updatedAt",
        "updatedByUserId",
        NULL::text AS "updatedByUsername",
        NULL::text AS "updatedByDisplayName"
    `,
    createdId,
    input.event.slug,
    input.event.category,
    input.event.title,
    input.event.summary,
    input.event.startsAt ? new Date(input.event.startsAt) : null,
    input.event.endsAt ? new Date(input.event.endsAt) : null,
    input.event.visible ?? true,
    input.event.highlight ?? false,
    input.event.archived ?? false,
    JSON.stringify(input.event.metadata ?? {}),
    user?.id ?? null,
  );

  const event = rows[0] ? mapWebsiteEventRow(rows[0]) : null;

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "website.event_created",
    targetType: "website_event",
    targetId: rows[0]?.id ?? input.event.slug,
    metadata: {
      slug: input.event.slug,
      category: input.event.category,
      title: input.event.title,
    },
  });

  return event;
}

export async function updateWebsiteEvent(input: {
  eventId: string;
  reviewerDiscordId: string | null;
  event: WebsiteEventUpdateInput;
}) {
  const user = input.reviewerDiscordId
    ? await getUserByDiscordId(input.reviewerDiscordId)
    : null;

  const existingRows = await prisma.$queryRawUnsafe<WebsiteEventRow[]>(
    `
      SELECT
        "id",
        "slug",
        "category",
        "title",
        "summary",
        "startsAt",
        "endsAt",
        "visible",
        "highlight",
        "archived",
        "metadata",
        "updatedAt",
        "updatedByUserId",
        NULL::text AS "updatedByUsername",
        NULL::text AS "updatedByDisplayName"
      FROM "WebsiteEvent"
      WHERE "id" = $1
      LIMIT 1
    `,
    input.eventId,
  );

  const existing = existingRows[0];

  if (!existing) {
    throw new Error("Website event not found");
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE "WebsiteEvent"
      SET
        "slug" = $2,
        "category" = $3,
        "title" = $4,
        "summary" = $5,
        "startsAt" = $6,
        "endsAt" = $7,
        "visible" = $8,
        "highlight" = $9,
        "archived" = $10,
        "metadata" = $11::jsonb,
        "updatedByUserId" = $12,
        "updatedAt" = NOW()
      WHERE "id" = $1
    `,
    input.eventId,
    input.event.slug ?? existing.slug,
    input.event.category ?? existing.category,
    input.event.title ?? existing.title,
    input.event.summary ?? existing.summary,
    input.event.startsAt !== undefined
      ? input.event.startsAt
        ? new Date(input.event.startsAt)
        : null
      : existing.startsAt,
    input.event.endsAt !== undefined
      ? input.event.endsAt
        ? new Date(input.event.endsAt)
        : null
      : existing.endsAt,
    input.event.visible ?? existing.visible,
    input.event.highlight ?? existing.highlight,
    input.event.archived ?? existing.archived,
    JSON.stringify(input.event.metadata ?? existing.metadata ?? {}),
    user?.id ?? existing.updatedByUserId,
  );

  const updatedRows = await prisma.$queryRawUnsafe<WebsiteEventRow[]>(
    `
      SELECT
        we."id",
        we."slug",
        we."category",
        we."title",
        we."summary",
        we."startsAt",
        we."endsAt",
        we."visible",
        we."highlight",
        we."archived",
        we."metadata",
        we."updatedAt",
        we."updatedByUserId",
        u."username" AS "updatedByUsername",
        u."displayName" AS "updatedByDisplayName"
      FROM "WebsiteEvent" we
      LEFT JOIN "User" u ON u."id" = we."updatedByUserId"
      WHERE we."id" = $1
      LIMIT 1
    `,
    input.eventId,
  );

  const event = updatedRows[0] ? mapWebsiteEventRow(updatedRows[0]) : null;

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "website.event_updated",
    targetType: "website_event",
    targetId: input.eventId,
    metadata: {
      slug: event?.slug ?? existing.slug,
      category: event?.category ?? existing.category,
      visible: event?.visible ?? existing.visible,
      highlight: event?.highlight ?? existing.highlight,
      archived: event?.archived ?? existing.archived,
    },
  });

  return event;
}

export async function deleteWebsiteEvent(input: {
  eventId: string;
  reviewerDiscordId: string | null;
}) {
  const existingRows = await prisma.$queryRawUnsafe<WebsiteEventRow[]>(
    `
      SELECT
        "id",
        "slug",
        "category",
        "title",
        "summary",
        "startsAt",
        "endsAt",
        "visible",
        "highlight",
        "archived",
        "metadata",
        "updatedAt",
        "updatedByUserId",
        NULL::text AS "updatedByUsername",
        NULL::text AS "updatedByDisplayName"
      FROM "WebsiteEvent"
      WHERE "id" = $1
      LIMIT 1
    `,
    input.eventId,
  );

  const existing = existingRows[0];

  if (!existing) {
    throw new Error("Website event not found");
  }

  await prisma.$executeRawUnsafe(
    `
      DELETE FROM "WebsiteEvent"
      WHERE "id" = $1
    `,
    input.eventId,
  );

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "website.event_deleted",
    targetType: "website_event",
    targetId: input.eventId,
    metadata: {
      slug: existing.slug,
      category: existing.category,
      title: existing.title,
    },
  });
}
