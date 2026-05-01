"use client";

import { useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type ValorantAccount = {
  puuid: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  region: string | null;
  trackerUrl: string | null;
  syncEnabled: boolean;
  lastSyncedAt: string | null;
};

type AggregateItem = {
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
  computedAt: string;
  metadata: Record<string, unknown>;
};

type AccountResponse = { account: ValorantAccount | null };
type AggregatesResponse = { items: AggregateItem[] };
type RecomputeResponse = {
  result: {
    status: string;
    summary?: string;
    scope?: string;
    leaderboardScope?: string | null;
    totals?: Record<string, unknown>;
  };
};

type AccountForm = {
  discordId: string;
  riotGameName: string;
  riotTagLine: string;
  region: string;
  trackerUrl: string;
  puuid: string;
  syncEnabled: boolean;
};

type MatchForm = {
  discordId: string;
  riotMatchId: string;
  queue: "competitive" | "premier" | "league" | "tournament" | "custom";
  queueMode: string;
  map: string;
  season: string;
  startedAt: string;
  agent: string;
  teamSide: string;
  won: boolean;
  kills: string;
  deaths: string;
  assists: string;
  headshots: string;
  bodyshots: string;
  legshots: string;
  acs: string;
  kast: string;
  damage: string;
  plants: string;
  defuses: string;
  firstBloods: string;
  firstDeaths: string;
};

const initialAccountForm: AccountForm = {
  discordId: "",
  riotGameName: "",
  riotTagLine: "",
  region: "eu",
  trackerUrl: "",
  puuid: "",
  syncEnabled: true,
};

const initialMatchForm: MatchForm = {
  discordId: "",
  riotMatchId: "",
  queue: "competitive",
  queueMode: "competitive",
  map: "",
  season: "",
  startedAt: "",
  agent: "",
  teamSide: "attack",
  won: true,
  kills: "20",
  deaths: "12",
  assists: "7",
  headshots: "18",
  bodyshots: "62",
  legshots: "9",
  acs: "245",
  kast: "74",
  damage: "3250",
  plants: "0",
  defuses: "0",
  firstBloods: "3",
  firstDeaths: "2",
};

function parseInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number.parseInt(value, 10);
}

function parseFloatValue(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number.parseFloat(value);
}

export function ValorantRiotManager({ session }: { session: SessionIdentity }) {
  const [accountForm, setAccountForm] = useState<AccountForm>(initialAccountForm);
  const [matchForm, setMatchForm] = useState<MatchForm>(initialMatchForm);
  const [accountResult, setAccountResult] = useState<ValorantAccount | null>(null);
  const [aggregates, setAggregates] = useState<AggregateItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [recomputing, setRecomputing] = useState(false);

  function setAccountField<K extends keyof AccountForm>(key: K, value: AccountForm[K]) {
    setAccountForm((current) => ({ ...current, [key]: value }));
  }

  function setMatchField<K extends keyof MatchForm>(key: K, value: MatchForm[K]) {
    setMatchForm((current) => ({ ...current, [key]: value }));
  }

  async function loadAccount() {
    if (!accountForm.discordId.trim()) {
      setMessage("Discord ID is required before loading a Valorant account.");
      return;
    }

    setLoadingAccount(true);
    setMessage(null);

    try {
      const [accountResponse, aggregateResponse] = await Promise.all([
        adminApiRequest<AccountResponse>(
          `/valorant-riot/account/${accountForm.discordId.trim()}`,
          session,
        ),
        adminApiRequest<AggregatesResponse>(
          `/valorant-riot/aggregates/${accountForm.discordId.trim()}`,
          session,
        ),
      ]);

      setAccountResult(accountResponse.account);
      setAggregates(aggregateResponse.items);

      if (accountResponse.account) {
        setAccountForm((current) => ({
          ...current,
          riotGameName: accountResponse.account?.riotGameName ?? "",
          riotTagLine: accountResponse.account?.riotTagLine ?? "",
          region: accountResponse.account?.region ?? current.region,
          trackerUrl: accountResponse.account?.trackerUrl ?? "",
          puuid: accountResponse.account?.puuid ?? "",
          syncEnabled: accountResponse.account?.syncEnabled ?? true,
        }));
      }

      setMessage(accountResponse.account ? "Valorant account loaded." : "No linked Valorant account found yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load Valorant account.");
    } finally {
      setLoadingAccount(false);
    }
  }

  async function saveAccount() {
    if (!accountForm.discordId.trim() || !accountForm.riotGameName.trim() || !accountForm.riotTagLine.trim()) {
      setMessage("Discord ID, Riot name, and Riot tagline are required.");
      return;
    }

    setSavingAccount(true);
    setMessage(null);

    try {
      const response = await adminApiRequest<{ result: { account: ValorantAccount | null } }>(
        `/valorant-riot/account/${accountForm.discordId.trim()}`,
        session,
        {
          method: "PUT",
          body: JSON.stringify({
            riotGameName: accountForm.riotGameName.trim(),
            riotTagLine: accountForm.riotTagLine.trim(),
            region: accountForm.region.trim(),
            trackerUrl: accountForm.trackerUrl.trim() || null,
            puuid: accountForm.puuid.trim() || null,
            syncEnabled: accountForm.syncEnabled,
          }),
        },
      );

      setAccountResult(response.result.account);
      setMessage("Valorant account saved.");
      await loadAccount();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save Valorant account.");
    } finally {
      setSavingAccount(false);
    }
  }

  async function ingestMatch() {
    if (!matchForm.discordId.trim() || !matchForm.riotMatchId.trim()) {
      setMessage("Discord ID and Riot match ID are required before ingest.");
      return;
    }

    setIngesting(true);
    setMessage(null);

    try {
      const response = await adminApiRequest<{
        result: { queueAccepted: boolean; sourceScope: string; rejectionReason: string | null };
      }>(`/valorant-riot/ingest/${matchForm.discordId.trim()}`, session, {
        method: "POST",
        body: JSON.stringify({
          match: {
            riotMatchId: matchForm.riotMatchId.trim(),
            queue: matchForm.queue,
            queueMode: matchForm.queueMode.trim() || null,
            map: matchForm.map.trim() || null,
            season: matchForm.season.trim() || null,
            startedAt: matchForm.startedAt ? new Date(matchForm.startedAt).toISOString() : null,
            rawPayload: {
              source: "admin_test_harness",
            },
          },
          player: {
            agent: matchForm.agent.trim() || null,
            teamSide: matchForm.teamSide.trim() || null,
            won: matchForm.won,
            kills: parseInteger(matchForm.kills),
            deaths: parseInteger(matchForm.deaths),
            assists: parseInteger(matchForm.assists),
            headshots: parseInteger(matchForm.headshots),
            bodyshots: parseInteger(matchForm.bodyshots),
            legshots: parseInteger(matchForm.legshots),
            acs: parseInteger(matchForm.acs),
            kast: parseFloatValue(matchForm.kast),
            damage: parseInteger(matchForm.damage),
            plants: parseInteger(matchForm.plants),
            defuses: parseInteger(matchForm.defuses),
            firstBloods: parseInteger(matchForm.firstBloods),
            firstDeaths: parseInteger(matchForm.firstDeaths),
            rawPayload: {
              source: "admin_test_harness",
            },
          },
        }),
      });

      setMessage(
        response.result.queueAccepted
          ? `Match ingested into ${response.result.sourceScope}.`
          : `Match stored but rejected for leaderboard use: ${response.result.rejectionReason ?? "policy blocked it"}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to ingest Valorant match.");
    } finally {
      setIngesting(false);
    }
  }

  async function recomputeAggregates() {
    if (!matchForm.discordId.trim()) {
      setMessage("Discord ID is required before recomputing aggregates.");
      return;
    }

    setRecomputing(true);
    setMessage(null);

    try {
      const response = await adminApiRequest<RecomputeResponse>(
        `/valorant-riot/recompute/${matchForm.discordId.trim()}`,
        session,
        { method: "POST" },
      );

      const aggregateResponse = await adminApiRequest<AggregatesResponse>(
        `/valorant-riot/aggregates/${matchForm.discordId.trim()}`,
        session,
      );

      setAggregates(aggregateResponse.items);
      setMessage(response.result.summary ?? "Aggregates recomputed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to recompute aggregates.");
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <div className="stack">
      {message ? <div className="notice">{message}</div> : null}

      <div className="grid grid--two">
        <section className="card stack">
          <div>
            <div className="tag">Riot Account</div>
            <h2 className="page-title">Link and inspect a Valorant identity</h2>
            <p className="page-copy">
              This is the first real test point: connect a Discord user to a Riot identity before we feed matches into the engine.
            </p>
          </div>

          <div className="field">
            <label htmlFor="riotAccountDiscordId">Discord ID</label>
            <input
              id="riotAccountDiscordId"
              className="input"
              value={accountForm.discordId}
              onChange={(event) => {
                setAccountField("discordId", event.target.value);
                setMatchField("discordId", event.target.value);
              }}
              placeholder="1248919319967039498"
            />
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="riotGameName">Riot Game Name</label>
              <input
                id="riotGameName"
                className="input"
                value={accountForm.riotGameName}
                onChange={(event) => setAccountField("riotGameName", event.target.value)}
                placeholder="floink"
              />
            </div>

            <div className="field">
              <label htmlFor="riotTagLine">Riot Tagline</label>
              <input
                id="riotTagLine"
                className="input"
                value={accountForm.riotTagLine}
                onChange={(event) => setAccountField("riotTagLine", event.target.value)}
                placeholder="shd"
              />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="riotRegion">Region</label>
              <input
                id="riotRegion"
                className="input"
                value={accountForm.region}
                onChange={(event) => setAccountField("region", event.target.value)}
                placeholder="eu"
              />
            </div>

            <div className="field">
              <label htmlFor="riotPuuid">PUUID</label>
              <input
                id="riotPuuid"
                className="input"
                value={accountForm.puuid}
                onChange={(event) => setAccountField("puuid", event.target.value)}
                placeholder="optional for manual tests"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="trackerUrl">Tracker URL</label>
            <input
              id="trackerUrl"
              className="input"
              value={accountForm.trackerUrl}
              onChange={(event) => setAccountField("trackerUrl", event.target.value)}
              placeholder="https://tracker.gg/valorant/profile/riot/..."
            />
          </div>

          <label className="detail-pill">
            <input
              type="checkbox"
              checked={accountForm.syncEnabled}
              onChange={(event) => setAccountField("syncEnabled", event.target.checked)}
            />{" "}
            Sync enabled
          </label>

          <div className="row">
            <button className="button button--primary" type="button" onClick={() => void saveAccount()} disabled={savingAccount}>
              {savingAccount ? "Saving..." : "Save Valorant Account"}
            </button>
            <button className="button button--secondary" type="button" onClick={() => void loadAccount()} disabled={loadingAccount}>
              {loadingAccount ? "Loading..." : "Load Account + Aggregates"}
            </button>
          </div>

          {accountResult ? (
            <div className="detail-item">
              <div className="detail-block__label">
                {(accountResult.riotGameName ?? "Unknown")}#{accountResult.riotTagLine ?? "?"}
              </div>
              <div className="field-hint">
                Region: {accountResult.region ?? "n/a"} · Sync: {accountResult.syncEnabled ? "on" : "off"}
              </div>
              <div className="field-hint">
                Last synced: {accountResult.lastSyncedAt ? new Date(accountResult.lastSyncedAt).toLocaleString() : "never"}
              </div>
              {accountResult.trackerUrl ? <div className="field-hint">{accountResult.trackerUrl}</div> : null}
            </div>
          ) : null}
        </section>

        <section className="card stack">
          <div>
            <div className="tag">Engine Test</div>
            <h2 className="page-title">Feed one competitive match into the pipeline</h2>
            <p className="page-copy">
              This is the test harness for today. We can push one normalized match through the policy layer, persist it, and recompute leaderboard stats.
            </p>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="riotMatchId">Riot Match ID</label>
              <input
                id="riotMatchId"
                className="input"
                value={matchForm.riotMatchId}
                onChange={(event) => setMatchField("riotMatchId", event.target.value)}
                placeholder="test-match-001"
              />
            </div>

            <div className="field">
              <label htmlFor="queue">Queue</label>
              <select
                id="queue"
                className="select"
                value={matchForm.queue}
                onChange={(event) => setMatchField("queue", event.target.value as MatchForm["queue"])}
              >
                <option value="competitive">Competitive</option>
                <option value="premier">Premier</option>
                <option value="league">League</option>
                <option value="tournament">Tournament</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="queueMode">Queue Mode</label>
              <input
                id="queueMode"
                className="input"
                value={matchForm.queueMode}
                onChange={(event) => setMatchField("queueMode", event.target.value)}
                placeholder="competitive"
              />
            </div>
            <div className="field">
              <label htmlFor="startedAt">Started At</label>
              <input
                id="startedAt"
                className="input"
                type="datetime-local"
                value={matchForm.startedAt}
                onChange={(event) => setMatchField("startedAt", event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="map">Map</label>
              <input id="map" className="input" value={matchForm.map} onChange={(event) => setMatchField("map", event.target.value)} placeholder="Ascent" />
            </div>
            <div className="field">
              <label htmlFor="season">Season</label>
              <input id="season" className="input" value={matchForm.season} onChange={(event) => setMatchField("season", event.target.value)} placeholder="Episode 12 Act 3" />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="agent">Agent</label>
              <input id="agent" className="input" value={matchForm.agent} onChange={(event) => setMatchField("agent", event.target.value)} placeholder="Jett" />
            </div>
            <div className="field">
              <label htmlFor="teamSide">Team Side</label>
              <input id="teamSide" className="input" value={matchForm.teamSide} onChange={(event) => setMatchField("teamSide", event.target.value)} placeholder="attack" />
            </div>
          </div>

          <label className="detail-pill">
            <input type="checkbox" checked={matchForm.won} onChange={(event) => setMatchField("won", event.target.checked)} /> Won match
          </label>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="kills">Kills</label>
              <input id="kills" className="input" value={matchForm.kills} onChange={(event) => setMatchField("kills", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="deaths">Deaths</label>
              <input id="deaths" className="input" value={matchForm.deaths} onChange={(event) => setMatchField("deaths", event.target.value)} />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="assists">Assists</label>
              <input id="assists" className="input" value={matchForm.assists} onChange={(event) => setMatchField("assists", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="acs">ACS</label>
              <input id="acs" className="input" value={matchForm.acs} onChange={(event) => setMatchField("acs", event.target.value)} />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="kast">KAST</label>
              <input id="kast" className="input" value={matchForm.kast} onChange={(event) => setMatchField("kast", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="damage">Damage</label>
              <input id="damage" className="input" value={matchForm.damage} onChange={(event) => setMatchField("damage", event.target.value)} />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="headshots">Headshots</label>
              <input id="headshots" className="input" value={matchForm.headshots} onChange={(event) => setMatchField("headshots", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="bodyshots">Bodyshots</label>
              <input id="bodyshots" className="input" value={matchForm.bodyshots} onChange={(event) => setMatchField("bodyshots", event.target.value)} />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="legshots">Legshots</label>
              <input id="legshots" className="input" value={matchForm.legshots} onChange={(event) => setMatchField("legshots", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="firstBloods">First Bloods</label>
              <input id="firstBloods" className="input" value={matchForm.firstBloods} onChange={(event) => setMatchField("firstBloods", event.target.value)} />
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="firstDeaths">First Deaths</label>
              <input id="firstDeaths" className="input" value={matchForm.firstDeaths} onChange={(event) => setMatchField("firstDeaths", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="plants">Plants</label>
              <input id="plants" className="input" value={matchForm.plants} onChange={(event) => setMatchField("plants", event.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="defuses">Defuses</label>
            <input id="defuses" className="input" value={matchForm.defuses} onChange={(event) => setMatchField("defuses", event.target.value)} />
          </div>

          <div className="row">
            <button className="button button--primary" type="button" onClick={() => void ingestMatch()} disabled={ingesting}>
              {ingesting ? "Ingesting..." : "Ingest Test Match"}
            </button>
            <button className="button button--secondary" type="button" onClick={() => void recomputeAggregates()} disabled={recomputing}>
              {recomputing ? "Recomputing..." : "Recompute Aggregates"}
            </button>
          </div>
        </section>
      </div>

      <section className="card stack">
        <div>
          <div className="tag">Aggregate Output</div>
          <h2 className="page-title">Current stored leaderboard stats</h2>
          <p className="page-copy">
            Once account linking, ingest, and recompute all work together, this is the proof that the pipeline is alive.
          </p>
        </div>

        {aggregates.length === 0 ? (
          <div className="notice">No aggregates stored yet for the currently loaded player.</div>
        ) : (
          <div className="detail-list">
            {aggregates.map((item) => (
              <div className="detail-item" key={`${item.scope}-${item.leaderboardScope ?? "none"}-${item.computedAt}`}>
                <div className="detail-block__label">
                  {item.scope.toUpperCase()} · {item.leaderboardScope ?? "no scope"}
                </div>
                <div className="field-hint">
                  Matches: {item.matches} · W/L: {item.wins}/{item.losses} · KD: {item.kd ?? "-"} · Win: {item.winRate ?? "-"}%
                </div>
                <div className="field-hint">
                  ACS: {item.acs ?? "-"} · KAST: {item.kast ?? "-"} · HS%: {item.hsPct ?? "-"} · Featured Score: {item.featuredScore ?? "-"}
                </div>
                <div className="field-hint">Computed: {new Date(item.computedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
