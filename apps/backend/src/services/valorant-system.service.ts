import { prisma } from "@kova/database";
import { randomUUID } from "node:crypto";
import type {
  ValorantMemberStateUpsertInput,
  ValorantSyncWindowCreateInput,
  ValorantSyncWindowUpdateInput,
} from "../schemas/valorant-system.js";
import { createAuditLog } from "./audit.service.js";
import { getUserByDiscordId } from "./users.service.js";

type ValorantMemberStateRow = {
  id: string;
  userId: string;
  discordId: string;
  username: string;
  displayName: string | null;
  teamAssignment: string;
  tournamentEligible: boolean;
  tournamentActive: boolean;
  premierActive: boolean;
  leagueActive: boolean;
  trackRanked: boolean;
  trackPremier: boolean;
  trackLeague: boolean;
  trackTournament: boolean;
  trackCustoms: boolean;
  customCaptureMode: string;
  statusNote: string | null;
  updatedAt: Date;
};

type ValorantSyncWindowRow = {
  id: string;
  memberStateId: string;
  label: string;
  sourceType: string;
  startsAt: Date | null;
  endsAt: Date | null;
  enabled: boolean;
  notes: string | null;
  updatedAt: Date;
  discordId: string;
  username: string;
  displayName: string | null;
};

const leaderboardStats = [
  { key: "overallScore", label: "Overall Score", purpose: "Default leaderboard order across KOVA." },
  { key: "kd", label: "K/D Ratio", purpose: "Quick combat efficiency signal." },
  { key: "winRate", label: "Win Rate", purpose: "Team-facing result consistency." },
  { key: "matches", label: "Matches", purpose: "Activity threshold and usage." },
  { key: "hsPct", label: "HS%", purpose: "Mechanical precision signal." },
  { key: "acs", label: "ACS", purpose: "General impact and combat pressure." },
] as const;

const playerCardStats = [
  { key: "matches", label: "Matches" },
  { key: "kd", label: "K/D Ratio" },
  { key: "winRate", label: "Win Rate" },
  { key: "kast", label: "KAST" },
] as const;

const expansionStats = [
  { key: "acs", label: "ACS" },
  { key: "hsPct", label: "HS%" },
  { key: "latestKda", label: "Latest K/D/A" },
] as const;

export function getValorantSystemConfig() {
  return {
    leaderboardStats,
    playerCardStats,
    expansionStats,
    defaultLeaderboardScope: {
      label: "KOVA Members Default",
      eligibleTeamAssignments: ["main", "academy"],
      includeQueues: ["competitive"],
      excludeCompetitiveVariants: ["skirmish", "ascension"],
      excludeTournamentOnlyPlayers: true,
      note: "The default members leaderboard should only show KOVA team members and only count standard competitive queue data.",
    },
    featuredScoreWeights: {
      winRate: 35,
      kd: 25,
      kda: 15,
      avgKills: 10,
      hsPct: 10,
      recentForm: 5,
    },
    memberStateNotes: [
      "KOVA should not treat every player match as valid data.",
      "Player state determines where a player belongs inside KOVA right now.",
      "Sync windows exist so the backend only captures customs or special matches when KOVA explicitly expects them.",
    ],
  };
}

function mapMemberState(row: ValorantMemberStateRow) {
  return {
    id: row.id,
    userId: row.userId,
    discordId: row.discordId,
    username: row.username,
    displayName: row.displayName,
    teamAssignment: row.teamAssignment,
    tournamentEligible: row.tournamentEligible,
    tournamentActive: row.tournamentActive,
    premierActive: row.premierActive,
    leagueActive: row.leagueActive,
    trackRanked: row.trackRanked,
    trackPremier: row.trackPremier,
    trackLeague: row.trackLeague,
    trackTournament: row.trackTournament,
    trackCustoms: row.trackCustoms,
    customCaptureMode: row.customCaptureMode,
    statusNote: row.statusNote,
    updatedAt: row.updatedAt,
  };
}

function mapSyncWindow(row: ValorantSyncWindowRow) {
  return {
    id: row.id,
    memberStateId: row.memberStateId,
    label: row.label,
    sourceType: row.sourceType,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    enabled: row.enabled,
    notes: row.notes,
    updatedAt: row.updatedAt,
    discordId: row.discordId,
    username: row.username,
    displayName: row.displayName,
  };
}

export async function listValorantMemberStates() {
  const rows = await prisma.$queryRawUnsafe<ValorantMemberStateRow[]>(`
    SELECT
      vms."id",
      vms."userId",
      u."discordId",
      u."username",
      u."displayName",
      vms."teamAssignment",
      vms."tournamentEligible",
      vms."tournamentActive",
      vms."premierActive",
      vms."leagueActive",
      vms."trackRanked",
      vms."trackPremier",
      vms."trackLeague",
      vms."trackTournament",
      vms."trackCustoms",
      vms."customCaptureMode",
      vms."statusNote",
      vms."updatedAt"
    FROM "ValorantMemberState" vms
    INNER JOIN "User" u ON u."id" = vms."userId"
    ORDER BY
      CASE vms."teamAssignment"
        WHEN 'main' THEN 0
        WHEN 'academy' THEN 1
        ELSE 2
      END,
      u."username" ASC
  `);

  return rows.map(mapMemberState);
}

export async function getValorantMemberStateByDiscordId(discordId: string) {
  const rows = await prisma.$queryRawUnsafe<ValorantMemberStateRow[]>(
    `
      SELECT
        vms."id",
        vms."userId",
        u."discordId",
        u."username",
        u."displayName",
        vms."teamAssignment",
        vms."tournamentEligible",
        vms."tournamentActive",
        vms."premierActive",
        vms."leagueActive",
        vms."trackRanked",
        vms."trackPremier",
        vms."trackLeague",
        vms."trackTournament",
        vms."trackCustoms",
        vms."customCaptureMode",
        vms."statusNote",
        vms."updatedAt"
      FROM "ValorantMemberState" vms
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE u."discordId" = $1
      LIMIT 1
    `,
    discordId,
  );

  return rows[0] ? mapMemberState(rows[0]) : null;
}

export async function upsertValorantMemberState(input: {
  discordId: string;
  reviewerDiscordId: string | null;
  state: ValorantMemberStateUpsertInput;
}) {
  const targetUser = await getUserByDiscordId(input.discordId);

  if (!targetUser) {
    throw new Error("User not found for Valorant member state");
  }

  const createdId = randomUUID();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ValorantMemberState" (
        "id",
        "userId",
        "teamAssignment",
        "tournamentEligible",
        "tournamentActive",
        "premierActive",
        "leagueActive",
        "trackRanked",
        "trackPremier",
        "trackLeague",
        "trackTournament",
        "trackCustoms",
        "customCaptureMode",
        "statusNote",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET
        "teamAssignment" = EXCLUDED."teamAssignment",
        "tournamentEligible" = EXCLUDED."tournamentEligible",
        "tournamentActive" = EXCLUDED."tournamentActive",
        "premierActive" = EXCLUDED."premierActive",
        "leagueActive" = EXCLUDED."leagueActive",
        "trackRanked" = EXCLUDED."trackRanked",
        "trackPremier" = EXCLUDED."trackPremier",
        "trackLeague" = EXCLUDED."trackLeague",
        "trackTournament" = EXCLUDED."trackTournament",
        "trackCustoms" = EXCLUDED."trackCustoms",
        "customCaptureMode" = EXCLUDED."customCaptureMode",
        "statusNote" = EXCLUDED."statusNote",
        "updatedAt" = NOW()
    `,
    createdId,
    targetUser.id,
    input.state.teamAssignment,
    input.state.tournamentEligible ?? false,
    input.state.tournamentActive ?? false,
    input.state.premierActive ?? false,
    input.state.leagueActive ?? false,
    input.state.trackRanked ?? true,
    input.state.trackPremier ?? false,
    input.state.trackLeague ?? false,
    input.state.trackTournament ?? false,
    input.state.trackCustoms ?? false,
    input.state.customCaptureMode ?? "whitelisted_windows",
    input.state.statusNote ?? null,
  );

  const rows = await prisma.$queryRawUnsafe<ValorantMemberStateRow[]>(
    `
      SELECT
        vms."id",
        vms."userId",
        u."discordId",
        u."username",
        u."displayName",
        vms."teamAssignment",
        vms."tournamentEligible",
        vms."tournamentActive",
        vms."premierActive",
        vms."leagueActive",
        vms."trackRanked",
        vms."trackPremier",
        vms."trackLeague",
        vms."trackTournament",
        vms."trackCustoms",
        vms."customCaptureMode",
        vms."statusNote",
        vms."updatedAt"
      FROM "ValorantMemberState" vms
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE u."discordId" = $1
      LIMIT 1
    `,
    input.discordId,
  );

  const state = rows[0] ? mapMemberState(rows[0]) : null;

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "valorant.member_state_saved",
    targetType: "valorant_member_state",
    targetId: state?.id ?? targetUser.id,
    metadata: {
      discordId: input.discordId,
      teamAssignment: input.state.teamAssignment,
      premierActive: input.state.premierActive ?? false,
      leagueActive: input.state.leagueActive ?? false,
      customCaptureMode: input.state.customCaptureMode ?? "whitelisted_windows",
    },
  });

  return state;
}

export async function listValorantSyncWindows() {
  const rows = await prisma.$queryRawUnsafe<ValorantSyncWindowRow[]>(`
    SELECT
      vsw."id",
      vsw."memberStateId",
      vsw."label",
      vsw."sourceType",
      vsw."startsAt",
      vsw."endsAt",
      vsw."enabled",
      vsw."notes",
      vsw."updatedAt",
      u."discordId",
      u."username",
      u."displayName"
    FROM "ValorantSyncWindow" vsw
    INNER JOIN "ValorantMemberState" vms ON vms."id" = vsw."memberStateId"
    INNER JOIN "User" u ON u."id" = vms."userId"
    ORDER BY vsw."startsAt" ASC NULLS LAST, vsw."createdAt" DESC
  `);

  return rows.map(mapSyncWindow);
}

export async function listValorantSyncWindowsForDiscordId(discordId: string) {
  const rows = await prisma.$queryRawUnsafe<ValorantSyncWindowRow[]>(
    `
      SELECT
        vsw."id",
        vsw."memberStateId",
        vsw."label",
        vsw."sourceType",
        vsw."startsAt",
        vsw."endsAt",
        vsw."enabled",
        vsw."notes",
        vsw."updatedAt",
        u."discordId",
        u."username",
        u."displayName"
      FROM "ValorantSyncWindow" vsw
      INNER JOIN "ValorantMemberState" vms ON vms."id" = vsw."memberStateId"
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE u."discordId" = $1
      ORDER BY vsw."startsAt" ASC NULLS LAST, vsw."createdAt" DESC
    `,
    discordId,
  );

  return rows.map(mapSyncWindow);
}

export async function createValorantSyncWindow(input: {
  reviewerDiscordId: string | null;
  window: ValorantSyncWindowCreateInput;
}) {
  const targetUser = await getUserByDiscordId(input.window.discordId);

  if (!targetUser) {
    throw new Error("User not found for Valorant sync window");
  }

  const stateRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "id" FROM "ValorantMemberState" WHERE "userId" = $1 LIMIT 1`,
    targetUser.id,
  );

  const stateId = stateRows[0]?.id;

  if (!stateId) {
    throw new Error("Create the member state before adding sync windows");
  }

  const createdId = randomUUID();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ValorantSyncWindow" (
        "id",
        "memberStateId",
        "label",
        "sourceType",
        "startsAt",
        "endsAt",
        "enabled",
        "notes",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `,
    createdId,
    stateId,
    input.window.label,
    input.window.sourceType,
    input.window.startsAt ? new Date(input.window.startsAt) : null,
    input.window.endsAt ? new Date(input.window.endsAt) : null,
    input.window.enabled ?? true,
    input.window.notes ?? null,
  );

  const rows = await prisma.$queryRawUnsafe<ValorantSyncWindowRow[]>(
    `
      SELECT
        vsw."id",
        vsw."memberStateId",
        vsw."label",
        vsw."sourceType",
        vsw."startsAt",
        vsw."endsAt",
        vsw."enabled",
        vsw."notes",
        vsw."updatedAt",
        u."discordId",
        u."username",
        u."displayName"
      FROM "ValorantSyncWindow" vsw
      INNER JOIN "ValorantMemberState" vms ON vms."id" = vsw."memberStateId"
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE vsw."id" = $1
      LIMIT 1
    `,
    createdId,
  );

  const window = rows[0] ? mapSyncWindow(rows[0]) : null;

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "valorant.sync_window_created",
    targetType: "valorant_sync_window",
    targetId: createdId,
    metadata: {
      discordId: input.window.discordId,
      label: input.window.label,
      sourceType: input.window.sourceType,
    },
  });

  return window;
}

export async function updateValorantSyncWindow(input: {
  windowId: string;
  reviewerDiscordId: string | null;
  window: ValorantSyncWindowUpdateInput;
}) {
  const existingRows = await prisma.$queryRawUnsafe<ValorantSyncWindowRow[]>(
    `
      SELECT
        vsw."id",
        vsw."memberStateId",
        vsw."label",
        vsw."sourceType",
        vsw."startsAt",
        vsw."endsAt",
        vsw."enabled",
        vsw."notes",
        vsw."updatedAt",
        u."discordId",
        u."username",
        u."displayName"
      FROM "ValorantSyncWindow" vsw
      INNER JOIN "ValorantMemberState" vms ON vms."id" = vsw."memberStateId"
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE vsw."id" = $1
      LIMIT 1
    `,
    input.windowId,
  );

  const existing = existingRows[0];

  if (!existing) {
    throw new Error("Valorant sync window not found");
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE "ValorantSyncWindow"
      SET
        "label" = $2,
        "sourceType" = $3,
        "startsAt" = $4,
        "endsAt" = $5,
        "enabled" = $6,
        "notes" = $7,
        "updatedAt" = NOW()
      WHERE "id" = $1
    `,
    input.windowId,
    input.window.label ?? existing.label,
    input.window.sourceType ?? existing.sourceType,
    input.window.startsAt !== undefined
      ? input.window.startsAt
        ? new Date(input.window.startsAt)
        : null
      : existing.startsAt,
    input.window.endsAt !== undefined
      ? input.window.endsAt
        ? new Date(input.window.endsAt)
        : null
      : existing.endsAt,
    input.window.enabled ?? existing.enabled,
    input.window.notes !== undefined ? input.window.notes : existing.notes,
  );

  const rows = await prisma.$queryRawUnsafe<ValorantSyncWindowRow[]>(
    `
      SELECT
        vsw."id",
        vsw."memberStateId",
        vsw."label",
        vsw."sourceType",
        vsw."startsAt",
        vsw."endsAt",
        vsw."enabled",
        vsw."notes",
        vsw."updatedAt",
        u."discordId",
        u."username",
        u."displayName"
      FROM "ValorantSyncWindow" vsw
      INNER JOIN "ValorantMemberState" vms ON vms."id" = vsw."memberStateId"
      INNER JOIN "User" u ON u."id" = vms."userId"
      WHERE vsw."id" = $1
      LIMIT 1
    `,
    input.windowId,
  );

  const window = rows[0] ? mapSyncWindow(rows[0]) : null;

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "valorant.sync_window_updated",
    targetType: "valorant_sync_window",
    targetId: input.windowId,
    metadata: {
      label: window?.label ?? existing.label,
      sourceType: window?.sourceType ?? existing.sourceType,
      enabled: window?.enabled ?? existing.enabled,
    },
  });

  return window;
}
