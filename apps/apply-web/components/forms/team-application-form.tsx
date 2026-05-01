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

type TeamFormState = {
  riotId: string;
  trackerUrl: string;
  peakRank: string;
  currentRank: string;
  mainAgents: string[];
  region: string;
  socialLinks: string;
  applyingFor: string;
  experience: string;
  motivation: string;
  availability: string;
};

const initialState: TeamFormState = {
  riotId: "",
  trackerUrl: "",
  peakRank: "",
  currentRank: "",
  mainAgents: [],
  region: "",
  socialLinks: "",
  applyingFor: "",
  experience: "",
  motivation: "",
  availability: "",
};

export function TeamApplicationForm() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<TeamFormState>(initialState);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => "competitive:main_team_or_academy", []);

  useEffect(() => {
    const draft = loadDraft<TeamFormState>(draftKey);

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
        // Keep the form usable without blocking on profile load.
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

  function setField<K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) {
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
        subtype: "main_team_or_academy",
        title: "Main Team / Academy Application",
        submission: {
          applyingFor: form.applyingFor,
          experience: form.experience,
          motivation: form.motivation,
          availability: form.availability,
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
        <h1 className="page-title">Main Team / Academy Application</h1>
        <p className="page-copy">
          Apply for the KOVA main roster or academy roster with your complete
          competitive profile.
        </p>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}
      {loadingProfile ? <div className="notice">Loading any saved profile data...</div> : null}

      <AccountSummary session={session} />

      <section className="stack">
        <h2 className="section-title">Player Profile</h2>
        <p className="section-subtitle">
          Your saved player profile will be reused across future competitive
          forms and can still be changed later in your profile area.
        </p>
        <div className="grid grid--two">
          <FormField label="Riot ID" labelNote="Opt-in needed later">
            <input className="input" value={form.riotId} onChange={(event) => setField("riotId", event.target.value)} placeholder="PlayerName#TAG" required />
          </FormField>
          <FormField label="Tracker Link">
            <input className="input" value={form.trackerUrl} onChange={(event) => setField("trackerUrl", event.target.value)} placeholder="https://tracker.gg/valorant/profile/riot/..." required />
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
          <textarea className="textarea" value={form.socialLinks} onChange={(event) => setField("socialLinks", event.target.value)} placeholder="Twitter, Twitch, YouTube, or other relevant links" />
        </FormField>
      </section>

      <section className="stack">
        <h2 className="section-title">Application</h2>

        <FormField label="Applying For" hint="Choose the roster target that fits your current level.">
          <select className="select" value={form.applyingFor} onChange={(event) => setField("applyingFor", event.target.value)} required>
            <option value="">Select team target</option>
            <option value="Main Team">Main Team</option>
            <option value="Academy Team">Academy Team</option>
            <option value="Either">Either</option>
          </select>
        </FormField>

        <FormField label="Competitive Experience" hint="Mention past teams, scrim level, tournaments, and any relevant results.">
          <textarea className="textarea" value={form.experience} onChange={(event) => setField("experience", event.target.value)} placeholder="Previous teams, scrims, tournaments, roles, achievements..." required />
        </FormField>

        <FormField label="Motivation" hint="Tell KOVA what makes you a strong fit for the roster.">
          <textarea className="textarea" value={form.motivation} onChange={(event) => setField("motivation", event.target.value)} placeholder="Why do you want to join KOVA?" required />
        </FormField>

        <FormField label="Availability" hint="Include your timezone, preferred scrim days, and weekly schedule.">
          <textarea className="textarea" value={form.availability} onChange={(event) => setField("availability", event.target.value)} placeholder="Scrim days, times, timezone, general availability..." required />
        </FormField>
      </section>

      <div className="submission-actions">
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
        <div className="submission-requirement">
          To finish this competitive application, you will need Discord login for submission and Riot login later for stats access.
        </div>
      </div>
    </form>
  );
}
