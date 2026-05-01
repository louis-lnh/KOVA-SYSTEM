"use client";

import { useEffect, useState } from "react";
import { apiRequest, type SessionIdentity } from "../lib/api";
import { AgentSelector, FormField, normalizeList, toNullable } from "./forms/shared";
import { agentOptions, rankOptions, regionOptions } from "../lib/form-options";

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

export function ProfileForm({ session }: { session: SessionIdentity }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    riotId: "",
    trackerUrl: "",
    currentRank: "",
    peakRank: "",
    mainAgents: [] as string[],
    region: "",
    socialLinks: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await apiRequest<ProfileResponse>("/profiles/me", session);

        if (!isMounted || !data.profile) {
          return;
        }

        setForm({
          riotId: data.profile.riotId ?? "",
          trackerUrl: data.profile.trackerUrl ?? "",
          currentRank: data.profile.currentRank ?? "",
          peakRank: data.profile.peakRank ?? "",
          mainAgents: data.profile.mainAgents,
          region: data.profile.region ?? "",
          socialLinks: data.profile.socialLinks.join(", "),
        });
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : "Failed to load profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (loading) {
    return <div className="notice">Loading profile...</div>;
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

  return (
    <div className="card stack">
      <div>
        <div className="tag">My Profile</div>
        <h2 className="section-title">Manage your saved details</h2>
        <p className="section-subtitle">
          Keep your Riot and player details up to date so future applications stay accurate.
        </p>
      </div>

      {message ? (
        <div className={message.includes("Failed") ? "notice notice--error" : "notice"}>
          {message}
        </div>
      ) : null}

      <div className="grid grid--two">
        <FormField label="Riot ID">
          <input className="input" value={form.riotId} onChange={(event) => setForm((current) => ({ ...current, riotId: event.target.value }))} placeholder="Player#TAG" />
        </FormField>
        <FormField label="Tracker URL">
          <input className="input" value={form.trackerUrl} onChange={(event) => setForm((current) => ({ ...current, trackerUrl: event.target.value }))} placeholder="https://tracker.gg/valorant/profile/riot/..." />
        </FormField>
        <FormField label="Current Rank">
          <select className="select" value={form.currentRank} onChange={(event) => setForm((current) => ({ ...current, currentRank: event.target.value }))}>
            <option value="">Select current rank</option>
            {rankOptions.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
          </select>
        </FormField>
        <FormField label="Peak Rank">
          <select className="select" value={form.peakRank} onChange={(event) => setForm((current) => ({ ...current, peakRank: event.target.value }))}>
            <option value="">Select peak rank</option>
            {rankOptions.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
          </select>
        </FormField>
        <FormField label="Region">
          <select className="select" value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}>
            <option value="">Select region</option>
            {regionOptions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
        </FormField>
      </div>

      <AgentSelector selectedAgents={form.mainAgents} onToggle={toggleAgent} options={agentOptions} />

      <FormField label="Social Links">
        <textarea className="textarea" value={form.socialLinks} onChange={(event) => setForm((current) => ({ ...current, socialLinks: event.target.value }))} placeholder="https://twitter.com/..., https://twitch.tv/..." />
      </FormField>

      <div className="row">
        <button
          className="button button--primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            setMessage(null);

            try {
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

              setMessage("Profile saved.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Failed to save profile.");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
