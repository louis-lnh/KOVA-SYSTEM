import { prisma } from "@kova/database";
import { Prisma } from "@prisma/client";

export type ApplicationCreatedNotificationPayload = {
  applicationId: string;
  title: string;
  category: string;
  subtype: string;
  applicantDiscordId: string;
  applicantUsername: string;
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
  return prisma.notificationEvent.update({
    where: {
      id,
    },
    data: {
      sentAt: new Date(),
    },
  });
}
