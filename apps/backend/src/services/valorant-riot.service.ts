import { prisma } from "@kova/database";
import { getUserByDiscordId } from "./users.service.js";
import {
  getValorantMemberStateByDiscordId,
  getValorantSystemConfig,
  listValorantSyncWindowsForDiscordId,
} from "./valorant-system.service.js";
import type {
  ValorantAccountUpsertInput,
  ValorantMatchIngestInput,
} from "../schemas/valorant-riot.js";
import { createAuditLog } from "./audit.service.js";

export type SupportedValorantQueue = "competitive" | "premier" | "league" | "tournament" | "custom";

export type ValorantLinkedAccount = {
  puuid: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  region: string | null;
  trackerUrl: string | null;
  syncEnabled: boolean;
  lastSyncedAt: Date | null;
};

export type ValorantSyncPolicy = {
  discordId: string;
  hasUser: boolean;
  hasLinkedAccount: boolean;
  linkedAccount: ValorantLinkedAccount | null;
  memberState: {
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
  } | null;
  allowedQueues: SupportedValorantQueue[];
  defaultLeaderboardEligible: boolean;
  queueFilters: {
    includeCompetitiveOnly: boolean;
    excludeVariants: string[];
    requireSyncWindowForCustoms: boolean;
  };
  syncWindows: Array<{
    id: string;
    label: string;
    sourceType: string;
    startsAt: Date | null;
    endsAt: Date | null;
    enabled: boolean;
    notes: string | null;
  }>;
};

export type ValorantSyncJobRequest = {
  discordId: string;
  triggeredBy: "admin" | "internal";
  mode: "account_refresh" | "recent_matches" | "full_recompute";
};

export type ValorantScaffoldJobResult = {
  status: "scaffolded";
  mode: ValorantSyncJobRequest["mode"];
  discordId: string;
  summary: string;
  policy: ValorantSyncPolicy;
};

type LinkedAccountRow = {
  id: string;
  userId: string;
  puuid: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  region: string | null;
  trackerUrl: string | null;
  syncEnabled: boolean;
  lastSyncedAt: Date | null;
};

type MatchAggregateRow = {
  won: boolean | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  headshots: number | null;
  bodyshots: number | null;
  legshots: number | null;
  acs: number | null;
  kast: number | null;
};

type IngestedMatchRow = {
  matchId: string;
  riotMatchId: string;
  queue: string;
  queueMode: string | null;
  sourceScope: string;
  queueAccepted: boolean;
};

type AggregateRow = {
  scope: string;
  leaderboardScope: string | null;
  matches: number;
  wins: number;
  losses: number;
  winRate: number | null;
  kd: number | null;
  kda: number | null;
  kast: number | null;
  acs: number | null;
  hsPct: number | null;
  avgKills: number | null;
  avgDeaths: number | null;
  avgAssists: number | null;
  featuredScore: number | null;
  computedAt: Date;
  metadata: Record<string, unknown>;
};

type RiotAccountByRiotIdResponse = {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
};

type RiotMatchlistResponse = {
  puuid?: string;
  history?: Array<{ matchId?: string; gameStartTimeMillis?: number }>;
};

type RiotMatchResponse = Record<string, unknown>;

export type RiotIdentityLookupInput = {
  riotGameName: string;
  riotTagLine: string;
  region: string;
};

export type RiotIdentityLookupResult = {
  status: "stubbed";
  riotGameName: string;
  riotTagLine: string;
  region: string;
  puuid: string | null;
  note: string;
};

function normalizeQueueName(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function roundNumber(value: number, digits = 2) {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

function getRiotApiKey() {
  const apiKey = process.env.RIOT_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RIOT_API_KEY is not configured in apps/backend/.env yet.");
  }

  return apiKey;
}

function resolveRiotRegionalHost(region: string | null | undefined) {
  const normalized = normalizeQueueName(region);

  if (
    [
      "eu",
      "euw",
      "eune",
      "tr",
      "ru",
      "me",
      "europe",
      "euw1",
      "eun1",
      "tr1",
      "ru1",
    ].includes(normalized)
  ) {
    return "https://europe.api.riotgames.com";
  }

  if (
    ["na", "latam", "lan", "las", "br", "americas", "na1", "br1", "la1", "la2"].includes(
      normalized,
    )
  ) {
    return "https://americas.api.riotgames.com";
  }

  if (
    ["ap", "asia", "kr", "jp", "jp1", "kr1", "oc", "oce", "oce1"].includes(normalized)
  ) {
    return "https://asia.api.riotgames.com";
  }

  return "https://europe.api.riotgames.com";
}

async function riotApiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": getRiotApiKey(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Riot API request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

function hasActiveSyncWindow(
  policy: ValorantSyncPolicy,
  sourceType: string,
  at: Date | null,
) {
  return policy.syncWindows.some((window) => {
    if (!window.enabled || window.sourceType !== sourceType) {
      return false;
    }

    if (!at) {
      return true;
    }

    const startsOk = !window.startsAt || window.startsAt <= at;
    const endsOk = !window.endsAt || window.endsAt >= at;

    return startsOk && endsOk;
  });
}

function resolveQueueDecision(input: {
  policy: ValorantSyncPolicy;
  queue: string;
  queueMode: string | null;
  startedAt: Date | null;
}) {
  const queue = normalizeQueueName(input.queue);
  const queueMode = normalizeQueueName(input.queueMode);

  if (queue === "competitive") {
    const blockedVariant = input.policy.queueFilters.excludeVariants.some((variant) =>
      queueMode.includes(variant),
    );

    return {
      sourceScope: "competitive",
      queueAccepted: input.policy.allowedQueues.includes("competitive") && !blockedVariant,
      rejectionReason: blockedVariant ? "competitive variant excluded" : null,
    };
  }

  if (queue === "premier") {
    return {
      sourceScope: "premier",
      queueAccepted: input.policy.allowedQueues.includes("premier"),
      rejectionReason: null,
    };
  }

  if (queue === "league") {
    return {
      sourceScope: "league",
      queueAccepted: input.policy.allowedQueues.includes("league"),
      rejectionReason: null,
    };
  }

  if (queue === "tournament") {
    return {
      sourceScope: "tournament",
      queueAccepted: input.policy.allowedQueues.includes("tournament"),
      rejectionReason: null,
    };
  }

  if (queue === "custom") {
    const allowedByWindow = hasActiveSyncWindow(input.policy, "custom", input.startedAt);
    const queueAccepted =
      input.policy.allowedQueues.includes("custom") &&
      (!input.policy.queueFilters.requireSyncWindowForCustoms || allowedByWindow);

    return {
      sourceScope: "custom",
      queueAccepted,
      rejectionReason: queueAccepted ? null : "custom match not inside an allowed sync window",
    };
  }

  return {
    sourceScope: queue || "unknown",
    queueAccepted: false,
    rejectionReason: "unsupported queue",
  };
}

async function getValorantAccountRecordForDiscordId(discordId: string): Promise<LinkedAccountRow | null> {
  const user = await getUserByDiscordId(discordId);

  if (!user) {
    return null;
  }

  const rows = await prisma.$queryRawUnsafe<LinkedAccountRow[]>(
    `
      SELECT
        "id",
        "userId",
        "puuid",
        "riotGameName",
        "riotTagLine",
        "region",
        "trackerUrl",
        "syncEnabled",
        "lastSyncedAt"
      FROM "ValorantAccount"
      WHERE "userId" = $1
      LIMIT 1
    `,
    user.id,
  );

  return rows[0] ?? null;
}

function mapLinkedAccountRow(row: LinkedAccountRow): ValorantLinkedAccount {
  return {
    puuid: row.puuid,
    riotGameName: row.riotGameName,
    riotTagLine: row.riotTagLine,
    region: row.region,
    trackerUrl: row.trackerUrl,
    syncEnabled: row.syncEnabled,
    lastSyncedAt: row.lastSyncedAt,
  };
}

export async function lookupRiotIdentity(
  input: RiotIdentityLookupInput,
): Promise<RiotIdentityLookupResult> {
  const host = resolveRiotRegionalHost(input.region);
  const gameName = encodeURIComponent(input.riotGameName);
  const tagLine = encodeURIComponent(input.riotTagLine);
  const data = await riotApiRequest<RiotAccountByRiotIdResponse>(
    `${host}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
  );

  return {
    status: "stubbed",
    riotGameName: data.gameName ?? input.riotGameName,
    riotTagLine: data.tagLine ?? input.riotTagLine,
    region: input.region,
    puuid: data.puuid ?? null,
    note: "Identity was resolved through Riot account lookup. RSO account-me flow can replace this later.",
  };
}

export async function getValorantAccountByDiscordId(
  discordId: string,
): Promise<ValorantLinkedAccount | null> {
  const row = await getValorantAccountRecordForDiscordId(discordId);

  return row ? mapLinkedAccountRow(row) : null;
}

export async function upsertValorantAccountForDiscordId(input: {
  discordId: string;
  reviewerDiscordId: string | null;
  account: ValorantAccountUpsertInput;
}) {
  const user = await getUserByDiscordId(input.discordId);

  if (!user) {
    throw new Error("User not found for Valorant account link");
  }

  const lookedUpIdentity = await lookupRiotIdentity({
    riotGameName: input.account.riotGameName,
    riotTagLine: input.account.riotTagLine,
    region: input.account.region,
  });

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ValorantAccount" (
        "id",
        "userId",
        "puuid",
        "riotGameName",
        "riotTagLine",
        "region",
        "trackerUrl",
        "rsoLinkedAt",
        "syncEnabled",
        "lastSyncedAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), $7, NULL, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET
        "puuid" = EXCLUDED."puuid",
        "riotGameName" = EXCLUDED."riotGameName",
        "riotTagLine" = EXCLUDED."riotTagLine",
        "region" = EXCLUDED."region",
        "trackerUrl" = EXCLUDED."trackerUrl",
        "syncEnabled" = EXCLUDED."syncEnabled",
        "updatedAt" = NOW()
    `,
    user.id,
    input.account.puuid ?? lookedUpIdentity.puuid,
    input.account.riotGameName,
    input.account.riotTagLine,
    input.account.region,
    input.account.trackerUrl ?? null,
    input.account.syncEnabled ?? true,
  );

  const account = await getValorantAccountByDiscordId(input.discordId);

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "valorant.account_upserted",
    targetType: "valorant_account",
    targetId: user.id,
    metadata: {
      discordId: input.discordId,
      riotGameName: input.account.riotGameName,
      riotTagLine: input.account.riotTagLine,
      region: input.account.region,
      syncEnabled: input.account.syncEnabled ?? true,
      identityLookup: lookedUpIdentity.status,
    },
  });

  return {
    account,
    lookup: lookedUpIdentity,
  };
}

export async function getValorantSyncPolicyForDiscordId(
  discordId: string,
): Promise<ValorantSyncPolicy> {
  const user = await getUserByDiscordId(discordId);
  const memberState = await getValorantMemberStateByDiscordId(discordId);
  const syncWindows = await listValorantSyncWindowsForDiscordId(discordId);
  const linkedAccount = await getValorantAccountByDiscordId(discordId);

  const allowedQueues: SupportedValorantQueue[] = [];

  if (memberState?.trackRanked) {
    allowedQueues.push("competitive");
  }
  if (memberState?.trackPremier) {
    allowedQueues.push("premier");
  }
  if (memberState?.trackLeague) {
    allowedQueues.push("league");
  }
  if (memberState?.trackTournament) {
    allowedQueues.push("tournament");
  }
  if (memberState?.trackCustoms) {
    allowedQueues.push("custom");
  }

  const config = getValorantSystemConfig();
  const leaderboardEligible =
    memberState !== null &&
    config.defaultLeaderboardScope.eligibleTeamAssignments.includes(memberState.teamAssignment);

  return {
    discordId,
    hasUser: Boolean(user),
    hasLinkedAccount: Boolean(linkedAccount),
    linkedAccount,
    memberState: memberState
      ? {
          teamAssignment: memberState.teamAssignment,
          tournamentEligible: memberState.tournamentEligible,
          tournamentActive: memberState.tournamentActive,
          premierActive: memberState.premierActive,
          leagueActive: memberState.leagueActive,
          trackRanked: memberState.trackRanked,
          trackPremier: memberState.trackPremier,
          trackLeague: memberState.trackLeague,
          trackTournament: memberState.trackTournament,
          trackCustoms: memberState.trackCustoms,
          customCaptureMode: memberState.customCaptureMode,
          statusNote: memberState.statusNote,
        }
      : null,
    allowedQueues,
    defaultLeaderboardEligible: leaderboardEligible,
    queueFilters: {
      includeCompetitiveOnly: true,
      excludeVariants: config.defaultLeaderboardScope.excludeCompetitiveVariants,
      requireSyncWindowForCustoms:
        (memberState?.customCaptureMode ?? "whitelisted_windows") === "whitelisted_windows",
    },
    syncWindows: syncWindows.map((window) => ({
      id: window.id,
      label: window.label,
      sourceType: window.sourceType,
      startsAt: window.startsAt,
      endsAt: window.endsAt,
      enabled: window.enabled,
      notes: window.notes,
    })),
  };
}

export function listSupportedLeaderboardScopes() {
  return [
    {
      key: "members_default",
      title: "KOVA Members Default",
      summary: "Main and academy only, standard competitive queue only.",
    },
    {
      key: "premier_only",
      title: "Premier Only",
      summary: "For players accepted into KOVA Premier structures.",
    },
    {
      key: "tournament_event",
      title: "Tournament Event",
      summary: "Temporary event leaderboard for one tournament or summary page.",
    },
  ] as const;
}

export function getValorantMatchAcceptanceRules() {
  return {
    allowedDefaultQueue: "competitive",
    excludedCompetitiveVariants: ["skirmish", "ascension"],
    customPolicy: "only capture customs when a member state and valid sync window allow it",
    leaderboardRequirement:
      "default members leaderboard should only list main/academy players with valid KOVA-counted competitive data",
  } as const;
}

export async function fetchRecentValorantMatchesForDiscordId(input: {
  discordId: string;
  limit?: number;
}) {
  const account = await getValorantAccountByDiscordId(input.discordId);

  if (!account) {
    throw new Error("No linked Valorant account found for this user");
  }

  const region = account.region ?? "eu";
  let puuid = account.puuid;

  if (!puuid && account.riotGameName && account.riotTagLine) {
    const identity = await lookupRiotIdentity({
      riotGameName: account.riotGameName,
      riotTagLine: account.riotTagLine,
      region,
    });

    puuid = identity.puuid;

    if (puuid) {
      await upsertValorantAccountForDiscordId({
        discordId: input.discordId,
        reviewerDiscordId: null,
        account: {
          riotGameName: account.riotGameName,
          riotTagLine: account.riotTagLine,
          region,
          trackerUrl: account.trackerUrl,
          puuid,
          syncEnabled: account.syncEnabled,
        },
      });
    }
  }

  if (!puuid) {
    throw new Error("Could not resolve a PUUID for this Valorant account.");
  }

  const host = resolveRiotRegionalHost(region);
  const matchlist = await riotApiRequest<RiotMatchlistResponse>(
    `${host}/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}`,
  );

  const history = (matchlist.history ?? []).slice(0, input.limit ?? 5);
  const matches = await Promise.all(
    history.map(async (item) => {
      if (!item.matchId) {
        return null;
      }

      const detail = await riotApiRequest<RiotMatchResponse>(
        `${host}/val/match/v1/matches/${encodeURIComponent(item.matchId)}`,
      );

      return {
        matchId: item.matchId,
        gameStartTimeMillis: item.gameStartTimeMillis ?? null,
        detail,
      };
    }),
  );

  return {
    account: await getValorantAccountByDiscordId(input.discordId),
    puuid,
    count: matches.filter(Boolean).length,
    matches: matches.filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

export async function listValorantAggregatesForDiscordId(discordId: string) {
  const accountRow = await getValorantAccountRecordForDiscordId(discordId);

  if (!accountRow) {
    return [];
  }

  const rows = await prisma.$queryRawUnsafe<AggregateRow[]>(
    `
      SELECT
        "scope",
        "leaderboardScope",
        "matches",
        "wins",
        "losses",
        "winRate",
        "kd",
        "kda",
        "kast",
        "acs",
        "hsPct",
        "avgKills",
        "avgDeaths",
        "avgAssists",
        "featuredScore",
        "computedAt",
        "metadata"
      FROM "ValorantPlayerAggregate"
      WHERE "accountId" = $1
      ORDER BY "computedAt" DESC
    `,
    accountRow.id,
  );

  return rows;
}

export async function ingestValorantMatchForDiscordId(input: {
  discordId: string;
  reviewerDiscordId: string | null;
  payload: ValorantMatchIngestInput;
}) {
  const accountRow = await getValorantAccountRecordForDiscordId(input.discordId);

  if (!accountRow) {
    throw new Error("No linked Valorant account found for this user");
  }

  const policy = await getValorantSyncPolicyForDiscordId(input.discordId);
  const startedAt = input.payload.match.startedAt ? new Date(input.payload.match.startedAt) : null;
  const decision = resolveQueueDecision({
    policy,
    queue: input.payload.match.queue,
    queueMode: input.payload.match.queueMode ?? null,
    startedAt,
  });

  const matchRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `
      INSERT INTO "ValorantMatch" (
        "id",
        "riotMatchId",
        "queue",
        "queueMode",
        "map",
        "season",
        "startedAt",
        "rawPayload",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT ("riotMatchId")
      DO UPDATE SET
        "queue" = EXCLUDED."queue",
        "queueMode" = EXCLUDED."queueMode",
        "map" = EXCLUDED."map",
        "season" = EXCLUDED."season",
        "startedAt" = EXCLUDED."startedAt",
        "rawPayload" = EXCLUDED."rawPayload",
        "updatedAt" = NOW()
      RETURNING "id"
    `,
    input.payload.match.riotMatchId,
    input.payload.match.queue,
    input.payload.match.queueMode ?? null,
    input.payload.match.map ?? null,
    input.payload.match.season ?? null,
    startedAt,
    JSON.stringify(input.payload.match.rawPayload ?? {}),
  );

  const matchId = matchRows[0]?.id;

  if (!matchId) {
    throw new Error("Failed to persist Valorant match");
  }

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ValorantPlayerMatchStat" (
        "id",
        "matchId",
        "accountId",
        "userId",
        "queueAccepted",
        "sourceScope",
        "agent",
        "teamSide",
        "won",
        "kills",
        "deaths",
        "assists",
        "headshots",
        "bodyshots",
        "legshots",
        "acs",
        "kast",
        "damage",
        "plants",
        "defuses",
        "firstBloods",
        "firstDeaths",
        "rawPayload",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT ("matchId", "accountId")
      DO UPDATE SET
        "userId" = EXCLUDED."userId",
        "queueAccepted" = EXCLUDED."queueAccepted",
        "sourceScope" = EXCLUDED."sourceScope",
        "agent" = EXCLUDED."agent",
        "teamSide" = EXCLUDED."teamSide",
        "won" = EXCLUDED."won",
        "kills" = EXCLUDED."kills",
        "deaths" = EXCLUDED."deaths",
        "assists" = EXCLUDED."assists",
        "headshots" = EXCLUDED."headshots",
        "bodyshots" = EXCLUDED."bodyshots",
        "legshots" = EXCLUDED."legshots",
        "acs" = EXCLUDED."acs",
        "kast" = EXCLUDED."kast",
        "damage" = EXCLUDED."damage",
        "plants" = EXCLUDED."plants",
        "defuses" = EXCLUDED."defuses",
        "firstBloods" = EXCLUDED."firstBloods",
        "firstDeaths" = EXCLUDED."firstDeaths",
        "rawPayload" = EXCLUDED."rawPayload",
        "updatedAt" = NOW()
    `,
    matchId,
    accountRow.id,
    accountRow.userId,
    decision.queueAccepted,
    decision.sourceScope,
    input.payload.player.agent ?? null,
    input.payload.player.teamSide ?? null,
    input.payload.player.won ?? null,
    input.payload.player.kills ?? null,
    input.payload.player.deaths ?? null,
    input.payload.player.assists ?? null,
    input.payload.player.headshots ?? null,
    input.payload.player.bodyshots ?? null,
    input.payload.player.legshots ?? null,
    input.payload.player.acs ?? null,
    input.payload.player.kast ?? null,
    input.payload.player.damage ?? null,
    input.payload.player.plants ?? null,
    input.payload.player.defuses ?? null,
    input.payload.player.firstBloods ?? null,
    input.payload.player.firstDeaths ?? null,
    JSON.stringify(input.payload.player.rawPayload ?? {}),
  );

  await createAuditLog({
    actorDiscordId: input.reviewerDiscordId,
    action: "valorant.match_ingested",
    targetType: "valorant_match",
    targetId: matchId,
    metadata: {
      discordId: input.discordId,
      riotMatchId: input.payload.match.riotMatchId,
      queue: input.payload.match.queue,
      queueMode: input.payload.match.queueMode ?? null,
      sourceScope: decision.sourceScope,
      queueAccepted: decision.queueAccepted,
      rejectionReason: decision.rejectionReason,
    },
  });

  return {
    matchId,
    riotMatchId: input.payload.match.riotMatchId,
    sourceScope: decision.sourceScope,
    queueAccepted: decision.queueAccepted,
    rejectionReason: decision.rejectionReason,
    policy,
  };
}

export async function scheduleValorantAccountSync(
  input: ValorantSyncJobRequest,
): Promise<ValorantScaffoldJobResult> {
  const policy = await getValorantSyncPolicyForDiscordId(input.discordId);

  return {
    status: "scaffolded",
    mode: input.mode,
    discordId: input.discordId,
    summary:
      "Riot sync job scaffolding is ready. The real Riot API wiring, queue fetch, normalization, and aggregate persistence will plug into this policy next.",
    policy,
  };
}

export async function recomputeValorantAggregatesForDiscordId(discordId: string) {
  const policy = await getValorantSyncPolicyForDiscordId(discordId);
  const accountRow = await getValorantAccountRecordForDiscordId(discordId);

  if (!accountRow) {
    return {
      status: "skipped" as const,
      discordId,
      reason: "No linked Valorant account found",
      policy,
    };
  }

  const aggregateRows = await prisma.$queryRawUnsafe<MatchAggregateRow[]>(
    `
      SELECT
        s."won",
        s."kills",
        s."deaths",
        s."assists",
        s."headshots",
        s."bodyshots",
        s."legshots",
        s."acs",
        s."kast"
      FROM "ValorantPlayerMatchStat" s
      INNER JOIN "ValorantMatch" m ON m."id" = s."matchId"
      WHERE s."accountId" = $1
        AND s."queueAccepted" = true
        AND s."sourceScope" = 'competitive'
        AND LOWER(m."queue") = 'competitive'
    `,
    accountRow.id,
  );

  const matches = aggregateRows.length;
  const wins = aggregateRows.filter((row) => row.won === true).length;
  const losses = matches - wins;
  const totalKills = aggregateRows.reduce((sum, row) => sum + (row.kills ?? 0), 0);
  const totalDeaths = aggregateRows.reduce((sum, row) => sum + (row.deaths ?? 0), 0);
  const totalAssists = aggregateRows.reduce((sum, row) => sum + (row.assists ?? 0), 0);
  const totalHeadshots = aggregateRows.reduce((sum, row) => sum + (row.headshots ?? 0), 0);
  const totalBodyshots = aggregateRows.reduce((sum, row) => sum + (row.bodyshots ?? 0), 0);
  const totalLegshots = aggregateRows.reduce((sum, row) => sum + (row.legshots ?? 0), 0);
  const totalShots = totalHeadshots + totalBodyshots + totalLegshots;

  const acsValues = aggregateRows.map((row) => row.acs).filter((value): value is number => value !== null);
  const kastValues = aggregateRows
    .map((row) => row.kast)
    .filter((value): value is number => value !== null);

  const winRate = matches > 0 ? roundNumber((wins / matches) * 100) : null;
  const kd = matches > 0 ? roundNumber(totalKills / Math.max(totalDeaths, 1)) : null;
  const kda = matches > 0 ? roundNumber((totalKills + totalAssists) / Math.max(totalDeaths, 1)) : null;
  const acs = acsValues.length > 0 ? roundNumber(acsValues.reduce((sum, value) => sum + value, 0) / acsValues.length) : null;
  const kast =
    kastValues.length > 0 ? roundNumber(kastValues.reduce((sum, value) => sum + value, 0) / kastValues.length) : null;
  const hsPct = totalShots > 0 ? roundNumber((totalHeadshots / totalShots) * 100) : null;
  const avgKills = matches > 0 ? roundNumber(totalKills / matches) : null;
  const avgDeaths = matches > 0 ? roundNumber(totalDeaths / matches) : null;
  const avgAssists = matches > 0 ? roundNumber(totalAssists / matches) : null;

  const featuredScore =
    matches > 0
      ? roundNumber(
          (kd ?? 0) * 40 +
            ((winRate ?? 0) / 100) * 30 +
            ((kast ?? 0) / 100) * 20 +
            ((acs ?? 0) / 300) * 10,
        )
      : null;

  const metadata = {
    queue: "competitive",
    includedModes: ["competitive"],
    excludedVariants: policy.queueFilters.excludeVariants,
    leaderboardEligible: policy.defaultLeaderboardEligible,
    matchesConsidered: matches,
  };

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "ValorantPlayerAggregate" (
        "id",
        "accountId",
        "userId",
        "scope",
        "leaderboardScope",
        "matches",
        "wins",
        "losses",
        "winRate",
        "kd",
        "kda",
        "kast",
        "acs",
        "hsPct",
        "avgKills",
        "avgDeaths",
        "avgAssists",
        "featuredScore",
        "computedAt",
        "metadata"
      )
      VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        NOW(),
        $18::jsonb
      )
      ON CONFLICT ("accountId", "scope", "leaderboardScope")
      DO UPDATE SET
        "userId" = EXCLUDED."userId",
        "matches" = EXCLUDED."matches",
        "wins" = EXCLUDED."wins",
        "losses" = EXCLUDED."losses",
        "winRate" = EXCLUDED."winRate",
        "kd" = EXCLUDED."kd",
        "kda" = EXCLUDED."kda",
        "kast" = EXCLUDED."kast",
        "acs" = EXCLUDED."acs",
        "hsPct" = EXCLUDED."hsPct",
        "avgKills" = EXCLUDED."avgKills",
        "avgDeaths" = EXCLUDED."avgDeaths",
        "avgAssists" = EXCLUDED."avgAssists",
        "featuredScore" = EXCLUDED."featuredScore",
        "computedAt" = NOW(),
        "metadata" = EXCLUDED."metadata"
    `,
    accountRow.id,
    accountRow.userId,
    "competitive",
    policy.defaultLeaderboardEligible ? "members_default" : "competitive_unscoped",
    matches,
    wins,
    losses,
    winRate,
    kd,
    kda,
    kast,
    acs,
    hsPct,
    avgKills,
    avgDeaths,
    avgAssists,
    featuredScore,
    JSON.stringify(metadata),
  );

  return {
    status: "recomputed" as const,
    discordId,
    scope: "competitive",
    leaderboardScope: policy.defaultLeaderboardEligible ? "members_default" : "competitive_unscoped",
    totals: {
      matches,
      wins,
      losses,
      winRate,
      kd,
      kda,
      kast,
      acs,
      hsPct,
      avgKills,
      avgDeaths,
      avgAssists,
      featuredScore,
    },
    policy,
    summary:
      "Competitive-only aggregate recompute is now wired. The next step is feeding real Riot matches into this persistence flow.",
  };
}
