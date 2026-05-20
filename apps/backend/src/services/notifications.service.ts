import { prisma } from "@kova/database";
import { Prisma } from "@prisma/client";
import { createAuditLog } from "./audit.service.js";

export type ApplicationCreatedNotificationPayload = {
  applicationId: string;
  title: string;
  category: string;
  subtype: string;
  applicantDiscordId: string;
  applicantUsername: string;
  createdAt: string;
};

export type WebsiteEventCreatedNotificationPayload = {
  eventId: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: string | null;
  endsAt: string | null;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  eventLabel: string | null;
  seasonTag: string | null;
  participationNote: string | null;
  createdAt: string;
};

export type TournamentAnnouncementNotificationPayload = {
  tournamentId: string;
  slug: string;
  title: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  publicDetails: string | null;
  format: string | null;
  eventLabel: string | null;
  participationNote: string | null;
  registrationUrl: string | null;
  bracketUrl: string | null;
  streamUrl: string | null;
  prizePool: string | null;
  overrideMessage: string | null;
  createdAt: string;
};

export async function createApplicationCreatedNotification(input: {
  applicationId: string;
  title: string;
  category: string;
  subtype: string;
  applicantDiscordId: string;
  applicantUsername: string;
  createdAt: Date;
}) {
  return prisma.notificationEvent.create({
    data: {
      type: "application.created",
      targetChannel: "application_review",
      payload: {
        applicationId: input.applicationId,
        title: input.title,
        category: input.category,
        subtype: input.subtype,
        applicantDiscordId: input.applicantDiscordId,
        applicantUsername: input.applicantUsername,
        createdAt: input.createdAt.toISOString(),
      } satisfies ApplicationCreatedNotificationPayload as Prisma.InputJsonValue,
    },
  });
}

export async function createWebsiteEventCreatedNotification(input: {
  eventId: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: Date | null;
  endsAt: Date | null;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  eventLabel?: string | null;
  seasonTag?: string | null;
  participationNote?: string | null;
}) {
  return prisma.notificationEvent.create({
    data: {
      type: "website.event_created",
      targetChannel: "website_events",
      payload: {
        eventId: input.eventId,
        slug: input.slug,
        category: input.category,
        title: input.title,
        summary: input.summary,
        startsAt: input.startsAt?.toISOString() ?? null,
        endsAt: input.endsAt?.toISOString() ?? null,
        visible: input.visible,
        highlight: input.highlight,
        archived: input.archived,
        eventLabel: input.eventLabel ?? null,
        seasonTag: input.seasonTag ?? null,
        participationNote: input.participationNote ?? null,
        createdAt: new Date().toISOString(),
      } satisfies WebsiteEventCreatedNotificationPayload as Prisma.InputJsonValue,
    },
  });
}

export async function createTournamentAnnouncementNotification(input: {
  tournamentId: string;
  slug: string;
  title: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  metadata: {
    publicDetails?: string | undefined;
    format?: string | undefined;
    eventLabel?: string | undefined;
    participationNote?: string | undefined;
    registrationUrl?: string | undefined;
    bracketUrl?: string | undefined;
    streamUrl?: string | undefined;
    prizePool?: string | undefined;
  };
  overrideMessage: string | null;
}) {
  return prisma.notificationEvent.create({
    data: {
      type: "tournament.announcement",
      targetChannel: "tournament_announcements",
      payload: {
        tournamentId: input.tournamentId,
        slug: input.slug,
        title: input.title,
        status: input.status,
        startsAt: input.startsAt?.toISOString() ?? null,
        endsAt: input.endsAt?.toISOString() ?? null,
        publicDetails: input.metadata.publicDetails ?? null,
        format: input.metadata.format ?? null,
        eventLabel: input.metadata.eventLabel ?? null,
        participationNote: input.metadata.participationNote ?? null,
        registrationUrl: input.metadata.registrationUrl ?? null,
        bracketUrl: input.metadata.bracketUrl ?? null,
        streamUrl: input.metadata.streamUrl ?? null,
        prizePool: input.metadata.prizePool ?? null,
        overrideMessage: input.overrideMessage,
        createdAt: new Date().toISOString(),
      } satisfies TournamentAnnouncementNotificationPayload as Prisma.InputJsonValue,
    },
  });
}

export async function listPendingNotifications(type?: string) {
  const where: Prisma.NotificationEventWhereInput = {
    sentAt: null,
  };

  if (type) {
    where.type = type;
  }

  const items = await prisma.notificationEvent.findMany({
    where,
    orderBy: {
      createdAt: "asc",
    },
  });

  return items.map((item) => ({
    id: item.id,
    type: item.type,
    targetChannel: item.targetChannel,
    payload: item.payload,
    scheduledFor: item.scheduledFor,
    createdAt: item.createdAt,
  }));
}

export async function markNotificationSent(id: string) {
  const item = await prisma.notificationEvent.update({
    where: {
      id,
    },
    data: {
      sentAt: new Date(),
    },
  });

  await createAuditLog({
    actorDiscordId: null,
    action: "bot.notification_sent",
    targetType: "notification_event",
    targetId: item.id,
    metadata: {
      type: item.type,
      targetChannel: item.targetChannel,
    },
  });

  return item;
}
