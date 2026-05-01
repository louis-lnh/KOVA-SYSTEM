"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth-provider";
import { apiRequest } from "../../lib/api";
import { clearDraft, loadDraft, markPendingSubmit, saveDraft } from "../../lib/form-drafts";
import { FormField } from "./shared";

type EligibilityResponse = {
  eligible: boolean;
  teamType?: "main" | "academy" | null;
  applicationId?: string | null;
};

type PremierFormState = {
  hasPlayedPremierBefore: boolean;
  premierMotivation: string;
  premierAvailability: string;
  premierGoals: string;
  preferredRoleInTeam: string;
  highestPremierPoints: string;
  highestPremierTeamName: string;
  highestPremierSeasonAct: string;
  highestPremierLeague: string;
  highestPremierLeagueTeam: string;
  highestPremierLeagueSeasonAct: string;
};

const initialState: PremierFormState = {
  hasPlayedPremierBefore: false,
  premierMotivation: "",
  premierAvailability: "",
  premierGoals: "",
  preferredRoleInTeam: "",
  highestPremierPoints: "",
  highestPremierTeamName: "",
  highestPremierSeasonAct: "",
  highestPremierLeague: "",
  highestPremierLeagueTeam: "",
  highestPremierLeagueSeasonAct: "",
};

export function PremierApplicationForm() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<PremierFormState>(initialState);
  const [eligibility, setEligibility] = useState<EligibilityResponse>({
    eligible: false,
    teamType: null,
    applicationId: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => "competitive:premier", []);

  useEffect(() => {
    const draft = loadDraft<PremierFormState>(draftKey);

    if (draft) {
      setForm(draft);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const activeSession = session;
    let active = true;

    async function loadEligibility() {
      try {
        const result = await apiRequest<EligibilityResponse>(
          "/applications/premier-eligibility",
          activeSession,
        );

        if (active) {
          setEligibility(result);
        }
      } catch {
        if (active) {
          setEligibility({ eligible: false, teamType: null, applicationId: null });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEligibility();
    return () => {
      active = false;
    };
  }, [session]);

  function setField<K extends keyof PremierFormState>(field: K, value: PremierFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm() {
    if (!session) {
      saveDraft(draftKey, form);
      markPendingSubmit(pathname);
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!eligibility.eligible) {
      throw new Error("Premier is locked until you are accepted onto a KOVA team.");
    }

    await apiRequest("/applications", session, {
      method: "POST",
      body: JSON.stringify({
        category: "competitive",
        subtype: "premier",
        title: "Premier Application",
        submission: {
          teamType: eligibility.teamType ?? "main",
          sourceTeamApplicationId: eligibility.applicationId ?? null,
          hasPlayedPremierBefore: form.hasPlayedPremierBefore,
          premierMotivation: form.hasPlayedPremierBefore ? "" : form.premierMotivation,
          premierAvailability: form.hasPlayedPremierBefore ? "" : form.premierAvailability,
          premierGoals: form.hasPlayedPremierBefore ? "" : form.premierGoals,
          preferredRoleInTeam: form.hasPlayedPremierBefore ? "" : form.preferredRoleInTeam,
          highestPremierPoints: form.hasPlayedPremierBefore ? form.highestPremierPoints : "",
          highestPremierTeamName: form.hasPlayedPremierBefore ? form.highestPremierTeamName : "",
          highestPremierSeasonAct: form.hasPlayedPremierBefore ? form.highestPremierSeasonAct : "",
          highestPremierLeague: form.hasPlayedPremierBefore ? form.highestPremierLeague : "",
          highestPremierLeagueTeam: form.hasPlayedPremierBefore ? form.highestPremierLeagueTeam : "",
          highestPremierLeagueSeasonAct: form.hasPlayedPremierBefore ? form.highestPremierLeagueSeasonAct : "",
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
        <h1 className="page-title">Premier Application</h1>
        <p className="page-copy">
          Apply for KOVA Premier once your team status allows access.
        </p>
      </div>

      {loading ? <div className="notice">Checking Premier eligibility...</div> : null}
      {message ? <div className="notice notice--error">{message}</div> : null}
      {!loading && !eligibility.eligible ? (
        <div className="locked-note">
          Premier is currently locked. Once you are accepted onto a KOVA team,
          this form unlocks automatically.
        </div>
      ) : null}

      <FormField
        label="I have played Premier before"
        hint="This changes the questions below so we can either learn about your goals or your previous Premier results."
      >
        <input
          type="checkbox"
          checked={form.hasPlayedPremierBefore}
          onChange={(event) => setField("hasPlayedPremierBefore", event.target.checked)}
        />
      </FormField>

      {!form.hasPlayedPremierBefore ? (
        <div className="stack">
          <FormField label="Why do you want to join Premier?" hint="Tell KOVA why you want to compete in Premier specifically.">
            <textarea className="textarea" value={form.premierMotivation} onChange={(event) => setField("premierMotivation", event.target.value)} required />
          </FormField>
          <FormField label="Availability" hint="List the days and times you can regularly play.">
            <textarea className="textarea" value={form.premierAvailability} onChange={(event) => setField("premierAvailability", event.target.value)} required />
          </FormField>
          <FormField label="Premier Goals" hint="What are you hoping to achieve in the next Premier cycle?">
            <textarea className="textarea" value={form.premierGoals} onChange={(event) => setField("premierGoals", event.target.value)} />
          </FormField>
          <FormField label="Preferred Role in Team" hint="For example IGL, flex, duelist, initiator, controller, sentinel.">
            <input className="input" value={form.preferredRoleInTeam} onChange={(event) => setField("preferredRoleInTeam", event.target.value)} />
          </FormField>
        </div>
      ) : (
        <div className="stack">
          <FormField label="Highest Premier Points">
            <input className="input" value={form.highestPremierPoints} onChange={(event) => setField("highestPremierPoints", event.target.value)} required />
          </FormField>
          <FormField label="With Which Team">
            <input className="input" value={form.highestPremierTeamName} onChange={(event) => setField("highestPremierTeamName", event.target.value)} required />
          </FormField>
          <FormField label="Season and Act">
            <input className="input" value={form.highestPremierSeasonAct} onChange={(event) => setField("highestPremierSeasonAct", event.target.value)} required />
          </FormField>
          <FormField label="Highest Premier League">
            <select className="select" value={form.highestPremierLeague} onChange={(event) => setField("highestPremierLeague", event.target.value)} required>
              <option value="">Select highest league</option>
              {["Open", "Intermediate", "Advanced", "Elite", "Contender", "Invite"].map((league) => (
                <option key={league} value={league}>{league}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Highest League Team">
            <input className="input" value={form.highestPremierLeagueTeam} onChange={(event) => setField("highestPremierLeagueTeam", event.target.value)} required />
          </FormField>
          <FormField label="Highest League Season and Act">
            <input className="input" value={form.highestPremierLeagueSeasonAct} onChange={(event) => setField("highestPremierLeagueSeasonAct", event.target.value)} required />
          </FormField>
        </div>
      )}

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
