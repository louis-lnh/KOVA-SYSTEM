import { prisma } from "@kova/database";
import {
  Prisma,
  type ApplicationCategory as PrismaApplicationCategory,
  type ApplicationStatus as PrismaApplicationStatus,
} from "@prisma/client";
import type { ApplicationStatus } from "@kova/shared";
import type {
  ApplicationReviewUpdateInput,
  ApplicationSubmissionInput,
} from "../schemas/applications.js";
import { createAuditLog } from "./audit.service.js";
import { createApplicationCreatedNotification } from "./notifications.service.js";
import { ensureUserByDiscordId, getUserByDiscordId } from "./users.service.js";

export async function createApplicationForDiscordUser(
  discordId: string,
  input: ApplicationSubmissionInput,
) {
  const user = await ensureUserByDiscordId({
    discordId,
  });

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      category: mapCategoryToPrisma(input.category),
      subtype: input.subtype,
      title: input.title,
      submission: input.submission as Prisma.InputJsonValue,
    },
  });

  await createApplicationCreatedNotification({
    applicationId: application.id,
    title: application.title,
    category: input.category,
    subtype: input.subtype,
    applicantDiscordId: user.discordId,
    applicantUsername: user.displayName ?? user.username,
    createdAt: application.createdAt,
  });

  return application;
}

export async function listApplicationsForAdmin(filters?: {
  category?:
    | "competitive"
    | "staff"
    | "community"
    | "creative"
    | "partnerships";
  status?: ApplicationStatus;
  archived?: boolean;
}) {
  const where: Prisma.ApplicationWhereInput = {};

  if (filters?.category) {
    where.category = mapCategoryToPrisma(filters.category);
  }

  if (filters?.status) {
    where.status = mapStatusToPrisma(filters.status);
  }

  if (filters?.archived !== undefined) {
    where.archived = filters.archived;
  }

  const applications = await prisma.application.findMany({
    where,
    include: {
      user: true,
      reviewer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications.map((application: (typeof applications)[number]) => ({
    ...application,
    accessLevelHint: application.user.discordId,
  }));
}

export async function listApplicationsForDiscordUser(discordId: string) {
  const user = await getUserByDiscordId(discordId);

  if (!user) {
    return [];
  }

  return prisma.application.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPremierEligibilityForDiscordUser(discordId: string) {
  const user = await getUserByDiscordId(discordId);

  if (!user) {
    return {
      eligible: false,
      teamType: null,
      applicationId: null,
    };
  }

  const teamApplication = await prisma.application.findFirst({
    where: {
      userId: user.id,
      subtype: "main_team_or_academy",
      status: "ACCEPTED",
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!teamApplication) {
    return {
      eligible: false,
      teamType: null,
      applicationId: null,
    };
  }

  const submission = teamApplication.submission as { applyingFor?: unknown } | null;
  const applyingFor = typeof submission?.applyingFor === "string" ? submission.applyingFor : "";
  const teamType =
    applyingFor === "Academy Team"
      ? "academy"
      : ("main" as "main" | "academy");

  return {
    eligible: true,
    teamType,
    applicationId: teamApplication.id,
  };
}

export async function getApplicationByIdForAdmin(applicationId: string) {
  return prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      user: {
        include: {
          profile: true,
          access: true,
        },
      },
      reviewer: true,
    },
  });
}

export async function updateApplicationReview(input: {
  applicationId: string;
  reviewerDiscordId: string | null;
  status?: ApplicationReviewUpdateInput["status"];
  archived?: ApplicationReviewUpdateInput["archived"];
  internalNotes?: ApplicationReviewUpdateInput["internalNotes"];
}) {
  const reviewer = input.reviewerDiscordId
    ? await getUserByDiscordId(input.reviewerDiscordId)
    : null;

  const data: Prisma.ApplicationUpdateInput = {};

  if (input.status) {
    data.status = mapStatusToPrisma(input.status);
  }

  if (input.archived !== undefined) {
    data.archived = input.archived;
  }

  if (input.internalNotes !== undefined) {
    data.internalNotes = input.internalNotes;
  }

  if (reviewer) {
    data.reviewer = {
      connect: {
        id: reviewer.id,
      },
    };
    data.reviewedAt = new Date();
  }

  const application = await prisma.application.update({
    where: {
      id: input.applicationId,
    },
    data,
    include: {
      user: true,
      reviewer: true,
    },
  });

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "application.review_updated",
    targetType: "application",
    targetId: application.id,
    metadata: {
      status: input.status ?? null,
      archived: input.archived ?? null,
      internalNotesChanged: input.internalNotes !== undefined,
    },
  });

  return application;
}

function mapCategoryToPrisma(
  category:
    | "competitive"
    | "staff"
    | "community"
    | "creative"
    | "partnerships",
): PrismaApplicationCategory {
  switch (category) {
    case "staff":
      return "STAFF";
    case "community":
      return "COMMUNITY";
    case "creative":
      return "CREATIVE";
    case "partnerships":
      return "PARTNERSHIPS";
    default:
      return "COMPETITIVE";
  }
}

function mapStatusToPrisma(
  status: ApplicationStatus,
): PrismaApplicationStatus {
  switch (status) {
    case "accepted":
      return "ACCEPTED";
    case "rejected":
      return "REJECTED";
    default:
      return "PENDING";
  }
}
