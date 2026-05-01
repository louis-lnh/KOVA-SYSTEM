"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth-provider";
import { apiRequest } from "../../lib/api";
import { clearDraft, loadDraft, markPendingSubmit, saveDraft } from "../../lib/form-drafts";
import { agentOptions, rankOptions, regionOptions } from "../../lib/form-options";
import { AccountSummary, AgentSelector, FormField, normalizeList, toNullable } from "./shared";

type ProfileResponse = {
  profile: {
    riotId: string | null;
    trackerUrl: string | null;
    currentRank: string | null;
    peakRank: string | null;
    mainAgents: string[];
    region: string | null;
    socialLinks: string[];
  } | null;
};

type TournamentFormState = {
  riotId: string;
  trackerUrl: string;
  peakRank: string;
  currentRank: string;
  mainAgents: string[];
  region: string;
  socialLinks: string;
  tournamentId: string;
  lookingForTeam: boolean;
  teamName: string;
  roleInTeam: string;
  tournamentExperience: string;
  availability: string;
  notes: string;
};

const initialState: TournamentFormState = {
  riotId: "",
  trackerUrl: "",
  peakRank: "",
  currentRank: "",
  mainAgents: [],
  region: "",
  socialLinks: "",
  tournamentId: "manual_tournament",
  lookingForTeam: false,
  teamName: "",
  roleInTeam: "",
  tournamentExperience: "",
  availability: "",
  notes: "",
};

export function TournamentJoinForm() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<TournamentFormState>(initialState);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => "competitive:tournament", []);

  useEffect(() => {
    const draft = loadDraft<TournamentFormState>(draftKey);
    if (draft) {
      setForm(draft);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!session) {
      setLoadingProfile(false);
      return;
    }

    const activeSession = session;
    let active = true;

    async function loadProfile() {
      try {
        const data = await apiRequest<ProfileResponse>("/profiles/me", activeSession);

        if (!active || !data.profile) {
          return;
        }

        setForm((current) => ({
          ...current,
          riotId: current.riotId || data.profile?.riotId || "",
          trackerUrl: current.trackerUrl || data.profile?.trackerUrl || "",
          peakRank: current.peakRank || data.profile?.peakRank || "",
          currentRank: current.currentRank || data.profile?.currentRank || "",
          mainAgents: current.mainAgents.length ? current.mainAgents : data.profile?.mainAgents || [],
          region: current.region || data.profile?.region || "",
          socialLinks: current.socialLinks || data.profile?.socialLinks.join(", ") || "",
        }));
      } catch {
        // Keep form usable.
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [session]);

  function setField<K extends keyof TournamentFormState>(field: K, value: TournamentFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleAgent(agent: string) {
    setForm((current) => {
      if (current.mainAgents.includes(agent)) {
        return {
          ...current,
          mainAgents: current.mainAgents.filter((item) => item !== agent),
        };
      }

      if (current.mainAgents.length >= 3) {
        return current;
      }

      return {
        ...current,
        mainAgents: [...current.mainAgents, agent],
      };
    });
  }

  async function submitForm() {
    if (!session) {
      saveDraft(draftKey, form);
      markPendingSubmit(pathname);
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    await apiRequest("/profiles/me", session, {
      method: "POST",
      body: JSON.stringify({
        riotId: toNullable(form.riotId),
        trackerUrl: toNullable(form.trackerUrl),
        currentRank: toNullable(form.currentRank),
        peakRank: toNullable(form.peakRank),
        mainAgents: form.mainAgents,
        region: toNullable(form.region),
        socialLinks: normalizeList(form.socialLinks),
      }),
    });

    await apiRequest("/applications", session, {
      method: "POST",
      body: JSON.stringify({
        category: "competitive",
        subtype: "tournament",
        title: "Tournament Join",
        submission: {
          tournamentId: form.tournamentId,
          lookingForTeam: form.lookingForTeam,
          teamName: form.lookingForTeam ? "" : form.teamName,
          roleInTeam: form.roleInTeam,
          tournamentExperience: form.tournamentExperience,
          availability: form.availability,
          notes: form.notes,
        },
      }),
    });

    clearDraft(draftKey);
    router.push("/submitted");
  }

  return (
    <form
      className="card stack"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
          await submitForm();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Failed to submit application.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <div className="tag">Competitive</div>
        <h1 className="page-title">Tournament Join</h1>
        <p className="page-copy">
          Register yourself or your team for tournament opportunities through KOVA.
        </p>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}
      {loadingProfile ? <div className="notice">Loading any saved profile data...</div> : null}

      <AccountSummary session={session} />

      <section className="stack">
        <h2 className="section-title">Player Profile</h2>
        <p className="section-subtitle">
          Tournament signups still use your saved player profile so staff can
          review your level quickly without asking for the same details again.
        </p>
        <div className="grid grid--two">
          <FormField label="Riot ID" labelNote="Opt-in needed later">
            <input className="input" value={form.riotId} onChange={(event) => setField("riotId", event.target.value)} required />
          </FormField>
          <FormField label="Tracker Link">
            <input className="input" value={form.trackerUrl} onChange={(event) => setField("trackerUrl", event.target.value)} required />
          </FormField>
          <FormField label="Peak Rank">
            <select className="select" value={form.peakRank} onChange={(event) => setField("peakRank", event.target.value)} required>
              <option value="">Select peak rank</option>
              {rankOptions.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
            </select>
          </FormField>
          <FormField label="Current Rank">
            <select className="select" value={form.currentRank} onChange={(event) => setField("currentRank", event.target.value)} required>
              <option value="">Select current rank</option>
              {rankOptions.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
            </select>
          </FormField>
          <FormField label="Region">
            <select className="select" value={form.region} onChange={(event) => setField("region", event.target.value)} required>
              <option value="">Select region</option>
              {regionOptions.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
          </FormField>
        </div>
        <AgentSelector selectedAgents={form.mainAgents} onToggle={toggleAgent} options={agentOptions} />
        <FormField label="Social Links">
          <textarea className="textarea" value={form.socialLinks} onChange={(event) => setField("socialLinks", event.target.value)} />
        </FormField>
      </section>

      <section className="stack">
        <h2 className="section-title">Tournament Registration</h2>
        <FormField label="Tournament" hint="Use the event name, event slug, or the tournament identifier staff gave you.">
          <input className="input" value={form.tournamentId} onChange={(event) => setField("tournamentId", event.target.value)} placeholder="Tournament name or ID" required />
        </FormField>
        <FormField label="Looking for a team" hint="Enable this if you want KOVA to consider you as a solo player for team placement.">
          <input type="checkbox" checked={form.lookingForTeam} onChange={(event) => setField("lookingForTeam", event.target.checked)} />
        </FormField>
        {!form.lookingForTeam ? (
          <FormField label="Team Name" hint="Only needed if you are registering with a full or partial roster.">
            <input className="input" value={form.teamName} onChange={(event) => setField("teamName", event.target.value)} />
          </FormField>
        ) : null}
        <FormField label="Role in Team" hint="Tell us the role you expect to play for this event.">
          <input className="input" value={form.roleInTeam} onChange={(event) => setField("roleInTeam", event.target.value)} required />
        </FormField>
        <FormField label="Tournament Experience" hint="Share previous events, placements, and tournament-level experience.">
          <textarea className="textarea" value={form.tournamentExperience} onChange={(event) => setField("tournamentExperience", event.target.value)} required />
        </FormField>
        <FormField label="Availability" hint="Include your timezone and when you can play during the event.">
          <textarea className="textarea" value={form.availability} onChange={(event) => setField("availability", event.target.value)} required />
        </FormField>
        <FormField label="Additional Notes">
          <textarea className="textarea" value={form.notes} onChange={(event) => setField("notes", event.target.value)} />
        </FormField>
      </section>

      <div className="submission-actions">
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
        <div className="submission-requirement">
          To finish this competitive registration, you will need Discord login for submission and Riot login later for stats access.
        </div>
      </div>
    </form>
  );
}
