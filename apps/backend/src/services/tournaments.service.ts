import { prisma } from "@kova/database";
import { Prisma } from "@prisma/client";
import type {
  TournamentAnnouncementInput,
  TournamentCreateInput,
  TournamentUpdateInput,
} from "../schemas/tournaments.js";
import { notFound } from "../errors.js";
import { createAuditLog } from "./audit.service.js";
import { createTournamentAnnouncementNotification } from "./notifications.service.js";

type TournamentMetadata = {
  publicDetails?: string | undefined;
  format?: string | undefined;
  eventLabel?: string | undefined;
  participationNote?: string | undefined;
  registrationUrl?: string | undefined;
  bracketUrl?: string | undefined;
  streamUrl?: string | undefined;
  prizePool?: string | undefined;
};

function normalizeMetadata(metadata?: TournamentMetadata | null): TournamentMetadata {
  return {
    publicDetails: metadata?.publicDetails ?? "",
    format: metadata?.format ?? "",
    eventLabel: metadata?.eventLabel ?? "",
    participationNote: metadata?.participationNote ?? "",
    registrationUrl: metadata?.registrationUrl ?? "",
    bracketUrl: metadata?.bracketUrl ?? "",
    streamUrl: metadata?.streamUrl ?? "",
    prizePool: metadata?.prizePool ?? "",
  };
}

function mapTournament(tournament: {
  id: string;
  slug: string;
  title: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: tournament.id,
    slug: tournament.slug,
    title: tournament.title,
    status: tournament.status,
    startsAt: tournament.startsAt,
    endsAt: tournament.endsAt,
    metadata: normalizeMetadata((tournament.metadata as TournamentMetadata | null) ?? null),
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
  };
}

export async function listTournaments() {
  const items = await prisma.tournament.findMany({
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });

  return items.map(mapTournament);
}

export async function createTournament(input: {
  actorDiscordId: string | null;
  tournament: TournamentCreateInput;
}) {
  const tournament = await prisma.tournament.create({
    data: {
      slug: input.tournament.slug,
      title: input.tournament.title,
      status: input.tournament.status,
      startsAt: input.tournament.startsAt ? new Date(input.tournament.startsAt) : null,
      endsAt: input.tournament.endsAt ? new Date(input.tournament.endsAt) : null,
      metadata: normalizeMetadata(input.tournament.metadata) as Prisma.InputJsonValue,
    },
  });

  await createAuditLog({
    actorDiscordId: input.actorDiscordId,
    action: "tournament.created",
    targetType: "tournament",
    targetId: tournament.id,
    metadata: {
      slug: tournament.slug,
      title: tournament.title,
      status: tournament.status,
    },
  });

  return mapTournament(tournament);
}

export async function updateTournament(input: {
  tournamentId: string;
  actorDiscordId: string | null;
  tournament: TournamentUpdateInput;
}) {
  const existing = await prisma.tournament.findUnique({
    where: { id: input.tournamentId },
  });

  if (!existing) {
    throw notFound("Tournament not found", "tournament_not_found");
  }

  const mergedMetadata = normalizeMetadata({
    ...((existing.metadata as TournamentMetadata | null) ?? {}),
    ...(input.tournament.metadata ?? {}),
  });

  const tournament = await prisma.tournament.update({
    where: { id: input.tournamentId },
    data: {
      slug: input.tournament.slug ?? existing.slug,
      title: input.tournament.title ?? existing.title,
      status: input.tournament.status ?? existing.status,
      startsAt:
        input.tournament.startsAt !== undefined
          ? input.tournament.startsAt
            ? new Date(input.tournament.startsAt)
            : null
          : existing.startsAt,
      endsAt:
        input.tournament.endsAt !== undefined
          ? input.tournament.endsAt
            ? new Date(input.tournament.endsAt)
            : null
          : existing.endsAt,
      metadata: mergedMetadata as Prisma.InputJsonValue,
    },
  });

  await createAuditLog({
    actorDiscordId: input.actorDiscordId,
    action: "tournament.updated",
    targetType: "tournament",
    targetId: tournament.id,
    metadata: {
      slug: tournament.slug,
      title: tournament.title,
      status: tournament.status,
    },
  });

  return mapTournament(tournament);
}

export async function deleteTournament(input: {
  tournamentId: string;
  actorDiscordId: string | null;
}) {
  const existing = await prisma.tournament.findUnique({
    where: { id: input.tournamentId },
  });

  if (!existing) {
    throw notFound("Tournament not found", "tournament_not_found");
  }

  await prisma.tournament.delete({
    where: { id: input.tournamentId },
  });

  await createAuditLog({
    actorDiscordId: input.actorDiscordId,
    action: "tournament.deleted",
    targetType: "tournament",
    targetId: input.tournamentId,
    metadata: {
      slug: existing.slug,
      title: existing.title,
      status: existing.status,
    },
  });
}

export async function sendTournamentAnnouncement(input: {
  tournamentId: string;
  actorDiscordId: string | null;
  announcement: TournamentAnnouncementInput;
}) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: input.tournamentId },
  });

  if (!tournament) {
    throw notFound("Tournament not found", "tournament_not_found");
  }

  const mapped = mapTournament(tournament);

  const notification = await createTournamentAnnouncementNotification({
    tournamentId: mapped.id,
    slug: mapped.slug,
    title: mapped.title,
    status: mapped.status,
    startsAt: mapped.startsAt,
    endsAt: mapped.endsAt,
    metadata: mapped.metadata,
    overrideMessage: input.announcement.overrideMessage ?? null,
  });

  await createAuditLog({
    actorDiscordId: input.actorDiscordId,
    action: "tournament.announcement_queued",
    targetType: "tournament",
    targetId: mapped.id,
    metadata: {
      slug: mapped.slug,
      title: mapped.title,
      notificationId: notification.id,
    },
  });

  return {
    tournament: mapped,
    notification,
  };
}
