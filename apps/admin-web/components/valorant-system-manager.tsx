"use client";

import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type ValorantSystemConfig = {
  leaderboardStats: Array<{ key: string; label: string; purpose: string }>;
  playerCardStats: Array<{ key: string; label: string }>;
  expansionStats: Array<{ key: string; label: string }>;
  defaultLeaderboardScope: {
    label: string;
    eligibleTeamAssignments: string[];
    includeQueues: string[];
    excludeCompetitiveVariants: string[];
    excludeTournamentOnlyPlayers: boolean;
    note: string;
  };
  featuredScoreWeights: Record<string, number>;
  memberStateNotes: string[];
};

type ValorantMemberState = {
  id: string;
  discordId: string;
  username: string;
  displayName: string | null;
  teamAssignment: "none" | "main" | "academy";
  tournamentEligible: boolean;
  tournamentActive: boolean;
  premierActive: boolean;
  leagueActive: boolean;
  trackRanked: boolean;
  trackPremier: boolean;
  trackLeague: boolean;
  trackTournament: boolean;
  trackCustoms: boolean;
  customCaptureMode: "off" | "whitelisted_windows" | "always";
  statusNote: string | null;
  updatedAt: string;
};

type ValorantSyncWindow = {
  id: string;
  label: string;
  sourceType: "premier" | "tournament" | "league" | "custom";
  startsAt: string | null;
  endsAt: string | null;
  enabled: boolean;
  notes: string | null;
  discordId: string;
  username: string;
  displayName: string | null;
};

type MemberStatesResponse = { items: ValorantMemberState[] };
type SyncWindowsResponse = { items: ValorantSyncWindow[] };

type MemberStateForm = {
  discordId: string;
  teamAssignment: "none" | "main" | "academy";
  tournamentEligible: boolean;
  tournamentActive: boolean;
  premierActive: boolean;
  leagueActive: boolean;
  trackRanked: boolean;
  trackPremier: boolean;
  trackLeague: boolean;
  trackTournament: boolean;
  trackCustoms: boolean;
  customCaptureMode: "off" | "whitelisted_windows" | "always";
  statusNote: string;
};

type SyncWindowForm = {
  discordId: string;
  label: string;
  sourceType: "premier" | "tournament" | "league" | "custom";
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  notes: string;
};

const initialMemberStateForm: MemberStateForm = {
  discordId: "",
  teamAssignment: "none",
  tournamentEligible: false,
  tournamentActive: false,
  premierActive: false,
  leagueActive: false,
  trackRanked: true,
  trackPremier: false,
  trackLeague: false,
  trackTournament: false,
  trackCustoms: false,
  customCaptureMode: "whitelisted_windows",
  statusNote: "",
};

const initialSyncWindowForm: SyncWindowForm = {
  discordId: "",
  label: "",
  sourceType: "custom",
  startsAt: "",
  endsAt: "",
  enabled: true,
  notes: "",
};

export function ValorantSystemManager({ session }: { session: SessionIdentity }) {
  const [config, setConfig] = useState<ValorantSystemConfig | null>(null);
  const [states, setStates] = useState<ValorantMemberState[]>([]);
  const [windows, setWindows] = useState<ValorantSyncWindow[]>([]);
  const [stateForm, setStateForm] = useState<MemberStateForm>(initialMemberStateForm);
  const [windowForm, setWindowForm] = useState<SyncWindowForm>(initialSyncWindowForm);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState(false);
  const [savingWindow, setSavingWindow] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);

    try {
      const [configResponse, statesResponse, windowsResponse] = await Promise.all([
        adminApiRequest<ValorantSystemConfig>("/valorant-system/config", session),
        adminApiRequest<MemberStatesResponse>("/valorant-system/member-states", session),
        adminApiRequest<SyncWindowsResponse>("/valorant-system/sync-windows", session),
      ]);

      setConfig(configResponse);
      setStates(statesResponse.items);
      setWindows(windowsResponse.items);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load Valorant system data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function setStateField<K extends keyof MemberStateForm>(key: K, value: MemberStateForm[K]) {
    setStateForm((current) => ({ ...current, [key]: value }));
  }

  function setWindowField<K extends keyof SyncWindowForm>(key: K, value: SyncWindowForm[K]) {
    setWindowForm((current) => ({ ...current, [key]: value }));
  }

  function startEditingState(item: ValorantMemberState) {
    setMessage(null);
    setStateForm({
      discordId: item.discordId,
      teamAssignment: item.teamAssignment,
      tournamentEligible: item.tournamentEligible,
      tournamentActive: item.tournamentActive,
      premierActive: item.premierActive,
      leagueActive: item.leagueActive,
      trackRanked: item.trackRanked,
      trackPremier: item.trackPremier,
      trackLeague: item.trackLeague,
      trackTournament: item.trackTournament,
      trackCustoms: item.trackCustoms,
      customCaptureMode: item.customCaptureMode,
      statusNote: item.statusNote ?? "",
    });
  }

  function startEditingWindow(item: ValorantSyncWindow) {
    setEditingWindowId(item.id);
    setMessage(null);
    setWindowForm({
      discordId: item.discordId,
      label: item.label,
      sourceType: item.sourceType,
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
      enabled: item.enabled,
      notes: item.notes ?? "",
    });
  }

  function resetStateForm() {
    setStateForm(initialMemberStateForm);
  }

  function resetWindowForm() {
    setEditingWindowId(null);
    setWindowForm(initialSyncWindowForm);
  }

  async function saveMemberState() {
    if (!stateForm.discordId.trim()) {
      setMessage("Discord ID is required for member state updates.");
      return;
    }

    setSavingState(true);
    setMessage(null);

    try {
      await adminApiRequest(`/valorant-system/member-states/${stateForm.discordId.trim()}`, session, {
        method: "PUT",
        body: JSON.stringify({
          teamAssignment: stateForm.teamAssignment,
          tournamentEligible: stateForm.tournamentEligible,
          tournamentActive: stateForm.tournamentActive,
          premierActive: stateForm.premierActive,
          leagueActive: stateForm.leagueActive,
          trackRanked: stateForm.trackRanked,
          trackPremier: stateForm.trackPremier,
          trackLeague: stateForm.trackLeague,
          trackTournament: stateForm.trackTournament,
          trackCustoms: stateForm.trackCustoms,
          customCaptureMode: stateForm.customCaptureMode,
          statusNote: stateForm.statusNote || null,
        }),
      });

      setMessage("Valorant member state saved.");
      resetStateForm();
      await loadAll();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save member state.",
      );
    } finally {
      setSavingState(false);
    }
  }

  async function saveSyncWindow() {
    if (!windowForm.discordId.trim()) {
      setMessage("Discord ID is required before saving a sync window.");
      return;
    }

    setSavingWindow(true);
    setMessage(null);

    const payload = {
      discordId: windowForm.discordId.trim(),
      label: windowForm.label,
      sourceType: windowForm.sourceType,
      startsAt: windowForm.startsAt ? new Date(windowForm.startsAt).toISOString() : null,
      endsAt: windowForm.endsAt ? new Date(windowForm.endsAt).toISOString() : null,
      enabled: windowForm.enabled,
      notes: windowForm.notes || null,
    };

    try {
      if (editingWindowId) {
        await adminApiRequest(`/valorant-system/sync-windows/${editingWindowId}`, session, {
          method: "PATCH",
          body: JSON.stringify({
            label: payload.label,
            sourceType: payload.sourceType,
            startsAt: payload.startsAt,
            endsAt: payload.endsAt,
            enabled: payload.enabled,
            notes: payload.notes,
          }),
        });
        setMessage("Sync window updated.");
      } else {
        await adminApiRequest("/valorant-system/sync-windows", session, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Sync window created.");
      }

      resetWindowForm();
      await loadAll();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save sync window.",
      );
    } finally {
      setSavingWindow(false);
    }
  }

  async function toggleWindowEnabled(item: ValorantSyncWindow) {
    try {
      await adminApiRequest(`/valorant-system/sync-windows/${item.id}`, session, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !item.enabled }),
      });
      await loadAll();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update sync window state.",
      );
    }
  }

  return (
    <div className="stack">
      {message ? <div className="notice">{message}</div> : null}

      <div className="grid grid--two">
        <section className="card stack">
          <div>
            <div className="tag">Stat Model</div>
            <h2 className="page-title">Shared stat buckets</h2>
            <p className="page-copy">
              These are the shared stat groups the Riot engine should feed first so both the
              leaderboard and player-card layers stay consistent.
            </p>
          </div>

          {loading || !config ? (
            <div className="notice">Loading Riot system config...</div>
          ) : (
            <>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="detail-block__label">Leaderboard Stats</div>
                  <div className="about-list">
                    {config.leaderboardStats.map((item) => (
                      <div className="about-list__item" key={item.key}>
                        <strong>{item.label}</strong>
                        <div className="field-hint">{item.purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-block__label">Player Card Stats</div>
                  <div className="about-list">
                    {config.playerCardStats.map((item) => (
                      <div className="about-list__item" key={item.key}>{item.label}</div>
                    ))}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-block__label">{config.defaultLeaderboardScope.label}</div>
                  <div className="field-hint">{config.defaultLeaderboardScope.note}</div>
                  <div className="about-list">
                    <div className="about-list__item">
                      Team scope: {config.defaultLeaderboardScope.eligibleTeamAssignments.join(", ")}
                    </div>
                    <div className="about-list__item">
                      Allowed queue: {config.defaultLeaderboardScope.includeQueues.join(", ")}
                    </div>
                    <div className="about-list__item">
                      Excluded variants: {config.defaultLeaderboardScope.excludeCompetitiveVariants.join(", ")}
                    </div>
                    <div className="about-list__item">
                      Tournament-only players excluded: {config.defaultLeaderboardScope.excludeTournamentOnlyPlayers ? "yes" : "no"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="tag">System Notes</div>
              <div className="list-clean">
                {config.memberStateNotes.map((note) => (
                  <div className="list-clean__item" key={note}>{note}</div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="card stack">
          <div>
            <div className="tag">Member State</div>
            <h2 className="page-title">Control who counts for what</h2>
            <p className="page-copy">
              This is the important KOVA-only layer. It decides what role a player currently
              holds and which match environments should count toward stored stats.
            </p>
          </div>

          <div className="field">
            <label htmlFor="valorantStateDiscordId">Discord ID</label>
            <input
              id="valorantStateDiscordId"
              className="input"
              value={stateForm.discordId}
              onChange={(event) => setStateField("discordId", event.target.value)}
              placeholder="1248919319967039498"
            />
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="valorantTeamAssignment">Team Assignment</label>
              <select
                id="valorantTeamAssignment"
                className="select"
                value={stateForm.teamAssignment}
                onChange={(event) =>
                  setStateField("teamAssignment", event.target.value as MemberStateForm["teamAssignment"])
                }
              >
                <option value="none">None</option>
                <option value="main">Main</option>
                <option value="academy">Academy</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="valorantCaptureMode">Custom Capture Mode</label>
              <select
                id="valorantCaptureMode"
                className="select"
                value={stateForm.customCaptureMode}
                onChange={(event) =>
                  setStateField("customCaptureMode", event.target.value as MemberStateForm["customCaptureMode"])
                }
              >
                <option value="off">Off</option>
                <option value="whitelisted_windows">Whitelisted windows</option>
                <option value="always">Always</option>
              </select>
            </div>
          </div>

          <div className="detail-pill-grid">
            {[
              ["tournamentEligible", "Tournament Eligible"],
              ["tournamentActive", "Tournament Active"],
              ["premierActive", "Premier Active"],
              ["leagueActive", "League Active"],
              ["trackRanked", "Track Ranked"],
              ["trackPremier", "Track Premier"],
              ["trackLeague", "Track League"],
              ["trackTournament", "Track Tournament"],
              ["trackCustoms", "Track Customs"],
            ].map(([key, label]) => (
              <label className="detail-pill" key={key}>
                <input
                  type="checkbox"
                  checked={stateForm[key as keyof MemberStateForm] as boolean}
                  onChange={(event) =>
                    setStateField(key as keyof MemberStateForm, event.target.checked as never)
                  }
                />{" "}
                {label}
              </label>
            ))}
          </div>

          <div className="field">
            <label htmlFor="valorantStateNote">State Note</label>
            <textarea
              id="valorantStateNote"
              className="textarea"
              value={stateForm.statusNote}
              onChange={(event) => setStateField("statusNote", event.target.value)}
              placeholder="Optional staff note about why this player is in this tracking state"
            />
          </div>

          <div className="row">
            <button
              className="button button--primary"
              type="button"
              onClick={() => void saveMemberState()}
              disabled={savingState}
            >
              {savingState ? "Saving..." : "Save Member State"}
            </button>
            <button className="button button--secondary" type="button" onClick={resetStateForm}>
              Reset State Form
            </button>
          </div>
        </section>
      </div>

      <section className="card stack">
        <div>
          <div className="tag">Current Member States</div>
          <h2 className="page-title">Tracked KOVA member contexts</h2>
          <p className="page-copy">
            These records tell the future Riot engine who is on which team and what match types are currently valid to collect.
          </p>
        </div>

        {loading ? (
          <div className="notice">Loading member states...</div>
        ) : states.length === 0 ? (
          <div className="notice">No Valorant member states have been created yet.</div>
        ) : (
          <div className="detail-list">
            {states.map((item) => (
              <div className="detail-item" key={item.id}>
                <div className="detail-block__label">
                  {(item.displayName || item.username)} - {item.discordId}
                </div>
                <div className="field-hint">
                  Team: {item.teamAssignment} · Premier: {item.premierActive ? "on" : "off"} · League: {item.leagueActive ? "on" : "off"}
                </div>
                <div className="field-hint">
                  Capture: ranked {item.trackRanked ? "yes" : "no"}, premier {item.trackPremier ? "yes" : "no"}, league {item.trackLeague ? "yes" : "no"}, tournament {item.trackTournament ? "yes" : "no"}, customs {item.trackCustoms ? "yes" : "no"}
                </div>
                {item.statusNote ? <div>{item.statusNote}</div> : null}
                <div className="row">
                  <button className="button button--secondary" type="button" onClick={() => startEditingState(item)}>
                    Edit State
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid--two">
        <section className="card stack">
          <div>
            <div className="tag">Sync Windows</div>
            <h2 className="page-title">Whitelist valid capture periods</h2>
            <p className="page-copy">
              Use these windows for league, tournament, Premier, or approved custom periods so the backend only saves the matches that should count.
            </p>
          </div>

          <div className="field">
            <label htmlFor="valorantWindowDiscordId">Discord ID</label>
            <input
              id="valorantWindowDiscordId"
              className="input"
              value={windowForm.discordId}
              onChange={(event) => setWindowField("discordId", event.target.value)}
              placeholder="1248919319967039498"
            />
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="valorantWindowLabel">Label</label>
              <input
                id="valorantWindowLabel"
                className="input"
                value={windowForm.label}
                onChange={(event) => setWindowField("label", event.target.value)}
                placeholder="Premier Week 3"
              />
            </div>

            <div className="field">
              <label htmlFor="valorantWindowSource">Source Type</label>
              <select
                id="valorantWindowSource"
                className="select"
                value={windowForm.sourceType}
                onChange={(event) =>
                  setWindowField("sourceType", event.target.value as SyncWindowForm["sourceType"])
                }
              >
                <option value="custom">Custom</option>
                <option value="premier">Premier</option>
                <option value="tournament">Tournament</option>
                <option value="league">League</option>
              </select>
            </div>
          </div>

          <div className="grid grid--two">
            <div className="field">
              <label htmlFor="valorantWindowStartsAt">Starts At</label>
              <input
                id="valorantWindowStartsAt"
                className="input"
                type="datetime-local"
                value={windowForm.startsAt}
                onChange={(event) => setWindowField("startsAt", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="valorantWindowEndsAt">Ends At</label>
              <input
                id="valorantWindowEndsAt"
                className="input"
                type="datetime-local"
                value={windowForm.endsAt}
                onChange={(event) => setWindowField("endsAt", event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="valorantWindowNotes">Notes</label>
            <textarea
              id="valorantWindowNotes"
              className="textarea"
              value={windowForm.notes}
              onChange={(event) => setWindowField("notes", event.target.value)}
              placeholder="Optional reason or context for this capture window"
            />
          </div>

          <label className="detail-pill">
            <input
              type="checkbox"
              checked={windowForm.enabled}
              onChange={(event) => setWindowField("enabled", event.target.checked)}
            />{" "}
            Enabled
          </label>

          <div className="row">
            <button
              className="button button--primary"
              type="button"
              onClick={() => void saveSyncWindow()}
              disabled={savingWindow}
            >
              {savingWindow ? "Saving..." : editingWindowId ? "Save Window" : "Create Window"}
            </button>
            <button className="button button--secondary" type="button" onClick={resetWindowForm}>
              Reset Window Form
            </button>
          </div>
        </section>

        <section className="card stack">
          <div>
            <div className="tag">Saved Windows</div>
            <h2 className="page-title">Current capture windows</h2>
            <p className="page-copy">
              These windows are the future guardrails for collecting only the right matches.
            </p>
          </div>

          {loading ? (
            <div className="notice">Loading sync windows...</div>
          ) : windows.length === 0 ? (
            <div className="notice">No sync windows have been created yet.</div>
          ) : (
            <div className="detail-list">
              {windows.map((item) => (
                <div className="detail-item" key={item.id}>
                  <div className="detail-block__label">
                    {item.label} - {(item.displayName || item.username)}
                  </div>
                  <div className="field-hint">
                    {item.sourceType.toUpperCase()} · {item.enabled ? "enabled" : "disabled"}
                  </div>
                  <div className="field-hint">
                    {item.startsAt ? `Starts: ${new Date(item.startsAt).toLocaleString()}` : "No start set"}
                    {item.endsAt ? ` · Ends: ${new Date(item.endsAt).toLocaleString()}` : ""}
                  </div>
                  {item.notes ? <div>{item.notes}</div> : null}
                  <div className="row">
                    <button className="button button--secondary" type="button" onClick={() => startEditingWindow(item)}>
                      Edit Window
                    </button>
                    <button className="button button--secondary" type="button" onClick={() => void toggleWindowEnabled(item)}>
                      {item.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
