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
import { AccountSummary, FormField } from "./shared";

type PartnershipRequestState = {
  organizationName: string;
  contactName: string;
  contactRole: string;
  contactEmailOrDiscord: string;
  websiteOrSocials: string;
  partnershipType: string;
  audienceOrReach: string;
  proposal: string;
  timeline: string;
  extraNotes: string;
};

const initialState: PartnershipRequestState = {
  organizationName: "",
  contactName: "",
  contactRole: "",
  contactEmailOrDiscord: "",
  websiteOrSocials: "",
  partnershipType: "",
  audienceOrReach: "",
  proposal: "",
  timeline: "",
  extraNotes: "",
};

export function PartnershipRequestForm() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<PartnershipRequestState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draftKey = useMemo(() => "partnerships:partnership_request", []);

  useEffect(() => {
    const draft = loadDraft<PartnershipRequestState>(draftKey);

    if (draft) {
      setForm(draft);
    }
  }, [draftKey]);

  function setField<K extends keyof PartnershipRequestState>(
    field: K,
    value: PartnershipRequestState[K],
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
        category: "partnerships",
        subtype: "partnership_request",
        title: "Partnership Request",
        submission: {
          organizationName: form.organizationName,
          contactName: form.contactName,
          contactRole: form.contactRole,
          contactEmailOrDiscord: form.contactEmailOrDiscord,
          websiteOrSocials: form.websiteOrSocials,
          partnershipType: form.partnershipType,
          audienceOrReach: form.audienceOrReach,
          proposal: form.proposal,
          timeline: form.timeline,
          extraNotes: form.extraNotes,
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
        <div className="tag">Partnerships</div>
        <h1 className="page-title">Partnership Request</h1>
        <p className="page-copy">
          Reach out if you want to explore a direct partnership, collaboration,
          creator link-up, sponsor conversation, or other official connection
          with KOVA.
        </p>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}

      <AccountSummary session={session} />

      <section className="stack">
        <h2 className="section-title">Request Details</h2>
        <div className="grid grid--two">
          <FormField
            label="Organization or Brand Name"
            hint="Use the team, organization, company, creator brand, or community name."
          >
            <input
              className="input"
              value={form.organizationName}
              onChange={(event) => setField("organizationName", event.target.value)}
              placeholder="Name of your org, brand, or project"
              required
            />
          </FormField>

          <FormField
            label="Contact Name"
            hint="Who should KOVA speak to about this request?"
          >
            <input
              className="input"
              value={form.contactName}
              onChange={(event) => setField("contactName", event.target.value)}
              placeholder="Main contact person"
              required
            />
          </FormField>

          <FormField
            label="Contact Role"
            hint="Your role inside the organization or project."
          >
            <input
              className="input"
              value={form.contactRole}
              onChange={(event) => setField("contactRole", event.target.value)}
              placeholder="Founder, manager, owner, creator..."
              required
            />
          </FormField>

          <FormField
            label="Email or Discord"
            hint="Share the best direct contact method for follow-up."
          >
            <input
              className="input"
              value={form.contactEmailOrDiscord}
              onChange={(event) =>
                setField("contactEmailOrDiscord", event.target.value)
              }
              placeholder="Email address or Discord username"
              required
            />
          </FormField>
        </div>

        <FormField
          label="Website or Social Links"
          hint="Share the main place where KOVA can verify who you are."
        >
          <input
            className="input"
            value={form.websiteOrSocials}
            onChange={(event) => setField("websiteOrSocials", event.target.value)}
            placeholder="Website, socials, Linktree, or media kit"
          />
        </FormField>

        <FormField
          label="Partnership Type"
          hint="Examples: creator collab, esports org partnership, sponsor interest, event collaboration, community crossover."
        >
          <input
            className="input"
            value={form.partnershipType}
            onChange={(event) => setField("partnershipType", event.target.value)}
            placeholder="What kind of partnership are you proposing?"
            required
          />
        </FormField>

        <FormField
          label="Audience, Reach, or Relevant Background"
          hint="Give KOVA the context needed to understand your brand, audience, or current footprint."
        >
          <textarea
            className="textarea"
            value={form.audienceOrReach}
            onChange={(event) => setField("audienceOrReach", event.target.value)}
            placeholder="Audience size, region, current activity, past partnerships, or relevant background"
            required
          />
        </FormField>

        <FormField
          label="Proposal"
          hint="Explain what you want to build together and what both sides would ideally gain from it."
        >
          <textarea
            className="textarea"
            value={form.proposal}
            onChange={(event) => setField("proposal", event.target.value)}
            placeholder="What is the idea, and why does it make sense for KOVA?"
            required
          />
        </FormField>

        <FormField
          label="Timeline"
          hint="Share whether this is urgent, date-bound, or a general open conversation."
        >
          <textarea
            className="textarea"
            value={form.timeline}
            onChange={(event) => setField("timeline", event.target.value)}
            placeholder="Relevant dates, deadlines, event timing, or general availability"
            required
          />
        </FormField>

        <FormField label="Additional Notes">
          <textarea
            className="textarea"
            value={form.extraNotes}
            onChange={(event) => setField("extraNotes", event.target.value)}
            placeholder="Anything else KOVA should know before reviewing this request"
          />
        </FormField>
      </section>

      <div className="row">
        <button className="button button--primary" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
