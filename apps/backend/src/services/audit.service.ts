import { prisma } from "@kova/database";
import { Prisma } from "@prisma/client";
import { getUserByDiscordId } from "./users.service.js";

const DEFAULT_AUDIT_LOG_LIMIT = 50;
const MAX_AUDIT_LOG_LIMIT = 100;

const auditTaxonomy = [
  {
    id: "access",
    title: "Access & Permissions",
    subtypes: [
      {
        id: "assignments",
        title: "Assignments",
        actions: ["access.assigned"],
      },
    ],
  },
  {
    id: "applications",
    title: "Applications",
    subtypes: [
      {
        id: "review",
        title: "Review Decisions",
        actions: ["application.review_updated"],
      },
    ],
  },
  {
    id: "verification",
    title: "Verification",
    subtypes: [
      {
        id: "decisions",
        title: "Manual Decisions",
        actions: ["verification.approve", "verification.deny"],
      },
      {
        id: "records",
        title: "Record Upserts",
        actions: ["verification.upserted"],
      },
    ],
  },
  {
    id: "valorant",
    title: "Valorant",
    subtypes: [
      {
        id: "accounts",
        title: "Account Links",
        actions: ["valorant.account_upserted"],
      },
      {
        id: "member_states",
        title: "Member States",
        actions: ["valorant.member_state_saved"],
      },
      {
        id: "sync",
        title: "Sync & Windows",
        actions: [
          "valorant.sync_scheduled",
          "valorant.sync_window_created",
          "valorant.sync_window_updated",
        ],
      },
      {
        id: "matches",
        title: "Match Ingest",
        actions: ["valorant.match_ingested"],
      },
    ],
  },
  {
    id: "website",
    title: "Website",
    subtypes: [
      {
        id: "content",
        title: "Content",
        actions: ["website.content_saved"],
      },
      {
        id: "events",
        title: "Events",
        actions: [
          "website.event_created",
          "website.event_updated",
          "website.event_deleted",
        ],
      },
    ],
  },
  {
    id: "tournaments",
    title: "Tournaments",
    subtypes: [
      {
        id: "management",
        title: "Management",
        actions: ["tournament.created", "tournament.updated", "tournament.deleted"],
      },
      {
        id: "announcements",
        title: "Announcements",
        actions: ["tournament.announcement_queued"],
      },
    ],
  },
  {
    id: "bot_oauth",
    title: "Bot & OAuth",
    subtypes: [
      {
        id: "notifications",
        title: "Bot Notifications",
        actions: [
          "bot.notification_sent",
          "application.notification_queued",
          "website.notification_queued",
          "tournament.notification_queued",
        ],
      },
      {
        id: "oauth",
        title: "Discord OAuth",
        actions: [
          "auth.oauth_started",
          "auth.oauth_succeeded",
          "auth.oauth_failed",
          "auth.logout",
        ],
      },
      {
        id: "backend_opt_ins",
        title: "Backend Opt-ins",
        actions: ["bot.opt_in_created", "bot.opt_in_updated", "bot.opt_in_removed"],
      },
    ],
  },
  {
    id: "system",
    title: "System & Internal",
    subtypes: [
      {
        id: "internal_api",
        title: "Internal API",
        actions: ["internal.notification_polled"],
      },
      {
        id: "unknown",
        title: "Unclassified",
        actions: [],
      },
    ],
  },
] as const;

type AuditCategory = (typeof auditTaxonomy)[number];
type AuditSubtype = AuditCategory["subtypes"][number];

const auditActionIndex = new Map<string, {
  category: {
    id: string;
    title: string;
  };
  subtype: {
    id: string;
    title: string;
  };
}>(
  auditTaxonomy.flatMap((category) =>
    category.subtypes.flatMap((subtype) =>
      subtype.actions.map((action) => [
        action,
        {
          category: {
            id: category.id,
            title: category.title,
          },
          subtype: {
            id: subtype.id,
            title: subtype.title,
          },
        },
      ] as const),
    ),
  ),
);

export function getAuditTaxonomy() {
  return auditTaxonomy.map((category) => ({
    id: category.id,
    title: category.title,
    subtypes: category.subtypes.map((subtype) => ({
      id: subtype.id,
      title: subtype.title,
      actions: [...subtype.actions],
    })),
  }));
}

function getActionsForCategory(categoryId: string) {
  return auditTaxonomy
    .find((category) => category.id === categoryId)
    ?.subtypes.flatMap((subtype) => [...subtype.actions]) ?? [];
}

function getActionsForSubtype(categoryId: string | undefined, subtypeId: string) {
  const categories = categoryId
    ? auditTaxonomy.filter((category) => category.id === categoryId)
    : auditTaxonomy;

  return categories.flatMap((category) =>
    category.subtypes
      .filter((subtype) => subtype.id === subtypeId)
      .flatMap((subtype) => [...subtype.actions]),
  );
}

function classifyAuditAction(action: string) {
  return (
    auditActionIndex.get(action) ?? {
      category: {
        id: "system",
        title: "System & Internal",
      },
      subtype: {
        id: "unknown",
        title: "Unclassified",
      },
    }
  );
}

export async function createAuditLog(input: {
  actorDiscordId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  const actor = input.actorDiscordId
    ? await getUserByDiscordId(input.actorDiscordId)
    : null;

  return prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listAuditLogs(input: {
  category?: string | undefined;
  subtype?: string | undefined;
  actorDiscordId?: string | undefined;
  action?: string | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
}) {
  const actor = input.actorDiscordId
    ? await getUserByDiscordId(input.actorDiscordId)
    : null;
  const limit = Math.min(
    Math.max(input.limit ?? DEFAULT_AUDIT_LOG_LIMIT, 1),
    MAX_AUDIT_LOG_LIMIT,
  );

  if (input.actorDiscordId && !actor) {
    return {
      items: [],
      nextCursor: null,
    };
  }

  const taxonomyActions = input.subtype
    ? getActionsForSubtype(input.category, input.subtype)
    : input.category
      ? getActionsForCategory(input.category)
      : [];
  const actionFilter =
    input.action ??
    (taxonomyActions.length > 0 ? ({ in: taxonomyActions } as const) : undefined);

  const where: Prisma.AuditLogWhereInput = {
    ...(actor ? { actorUserId: actor.id } : {}),
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(input.targetType ? { targetType: input.targetType } : {}),
    ...(input.targetId ? { targetId: input.targetId } : {}),
  };

  const query: Prisma.AuditLogFindManyArgs = {
    where,
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    skip: input.cursor ? 1 : 0,
    take: limit + 1,
  };

  if (input.cursor) {
    query.cursor = { id: input.cursor };
  }

  const logs = await prisma.auditLog.findMany(query);

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, limit) : logs;
  const actorIds = Array.from(
    new Set(
      items
        .map((log) => log.actorUserId)
        .filter((actorUserId): actorUserId is string => actorUserId !== null),
    ),
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: {
          id: {
            in: actorIds,
          },
        },
        select: {
          id: true,
          discordId: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      })
    : [];
  const actorById = new Map(actors.map((item) => [item.id, item]));

  return {
    items: items.map((log) => {
      const itemActor = log.actorUserId ? actorById.get(log.actorUserId) : null;

      return {
        ...classifyAuditAction(log.action),
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        createdAt: log.createdAt,
        actor: itemActor
          ? {
              id: itemActor.id,
              discordId: itemActor.discordId,
              username: itemActor.username,
              displayName: itemActor.displayName,
              avatarUrl: itemActor.avatarUrl,
            }
          : null,
      };
    }),
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}
