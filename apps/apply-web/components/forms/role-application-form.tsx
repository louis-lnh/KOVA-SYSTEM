"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth-provider";
import { apiRequest } from "../../lib/api";
import {
  clearDraft,
  loadDraft,
  markPendingSubmit,
  saveDraft,
} from "../../lib/form-drafts";
import { AccountSummary, FormField, normalizeList } from "./shared";

type RoleApplicationFormProps = {
  category: "staff" | "community" | "creative";
  subtype: string;
  title: string;
  intro: string;
  focusAreas: readonly string[];
  requireAgeCheck?: boolean;
  agePrompt?: string;
  ageHint?: string;
};

type RoleApplicationState = {
  roleInterest: string;
  timezone: string;
  availability: string;
  experience: string;
  strengths: string;
  motivation: string;
  age18OrOlder: string;
  portfolioLinks: string;
};

const initialState: RoleApplicationState = {
  roleInterest: "",
  timezone: "",
  availability: "",
  experience: "",
  strengths: "",
  motivation: "",
  age18OrOlder: "",
  portfolioLinks: "",
};

export function RoleApplicationForm({
  category,
  subtype,
  title,
  intro,
  focusAreas,
  requireAgeCheck = false,
  agePrompt = "18 or Older",
  ageHint = "Write yes or no. If age matters for a role later, staff can follow up.",
}: RoleApplicationFormProps) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<RoleApplicationState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => `${category}:${subtype}`, [category, subtype]);

  useEffect(() => {
    const draft = loadDraft<RoleApplicationState>(draftKey);

    if (draft) {
      setForm(draft);
    }
  }, [draftKey]);

  function setField<K extends keyof RoleApplicationState>(
    field: K,
    value: RoleApplicationState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitForm() {
    if (!session) {
      saveDraft(draftKey, form);
      markPendingSubmit(pathname);
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    await apiRequest("/applications", session, {
      method: "POST",
      body: JSON.stringify({
        category,
        subtype,
        title,
        submission: {
          roleInterest: form.roleInterest,
          timezone: form.timezone,
          availability: form.availability,
          experience: form.experience,
          strengths: form.strengths,
          motivation: form.motivation,
          age18OrOlder: form.age18OrOlder,
          portfolioLinks: normalizeList(form.portfolioLinks),
          focusAreas,
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
          setMessage(
            error instanceof Error ? error.message : "Failed to submit application.",
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <div className="tag">{category}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-copy">{intro}</p>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}

      <AccountSummary session={session} />

      <section className="stack">
        <h2 className="section-title">Role Fit</h2>
        <div className="grid grid--two">
          <FormField
            label="Role Interest"
            hint="Tell us which exact role or lane inside this area fits you best."
          >
            <input
              className="input"
              value={form.roleInterest}
              onChange={(event) => setField("roleInterest", event.target.value)}
              placeholder="Example: Moderator, video editor, event helper..."
              required
            />
          </FormField>

          <FormField
            label="Timezone"
            hint="Use your normal timezone so staff can understand coverage."
          >
            <input
              className="input"
              value={form.timezone}
              onChange={(event) => setField("timezone", event.target.value)}
              placeholder="CET / GMT+1 / EST"
              required
            />
          </FormField>
        </div>

        <FormField
          label="Availability"
          hint="Share your normal days, hours, and weekly availability."
        >
          <textarea
            className="textarea"
            value={form.availability}
            onChange={(event) => setField("availability", event.target.value)}
            placeholder="Days, times, and how consistently you can help"
            required
          />
        </FormField>

        <FormField
          label="Relevant Experience"
          hint="Mention previous teams, communities, projects, clients, or comparable work."
        >
          <textarea
            className="textarea"
            value={form.experience}
            onChange={(event) => setField("experience", event.target.value)}
            placeholder="Past work, responsibilities, achievements, or experience level"
            required
          />
        </FormField>

        <FormField
          label="Strengths"
          hint="What do you do especially well that would help KOVA?"
        >
          <textarea
            className="textarea"
            value={form.strengths}
            onChange={(event) => setField("strengths", event.target.value)}
            placeholder="Communication, editing, leadership, moderation, organization..."
            required
          />
        </FormField>

        <FormField
          label="Motivation"
          hint="Tell us why you want to work with KOVA and what kind of contribution you want to make."
        >
          <textarea
            className="textarea"
            value={form.motivation}
            onChange={(event) => setField("motivation", event.target.value)}
            placeholder="Why KOVA, and why this role?"
            required
          />
        </FormField>

        <div className="grid grid--two">
          {requireAgeCheck ? (
            <FormField label={agePrompt} hint={ageHint}>
              <input
                className="input"
                value={form.age18OrOlder}
                onChange={(event) => setField("age18OrOlder", event.target.value)}
                placeholder="Yes / No"
                required
              />
            </FormField>
          ) : null}

          <FormField
            label="Portfolio or Reference Links"
            hint="Optional, but useful for creative work, prior staff work, or proof of experience."
          >
            <input
              className="input"
              value={form.portfolioLinks}
              onChange={(event) => setField("portfolioLinks", event.target.value)}
              placeholder="Portfolio, socials, references, or examples"
            />
          </FormField>
        </div>
      </section>

      <div className="row">
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
