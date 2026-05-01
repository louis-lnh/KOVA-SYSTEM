"use client";

import { useMemo, useState } from "react";
import { apiRequest, type SessionIdentity } from "../lib/api";
import { applyCategories, getCategoryById, getSubtypeById } from "../lib/kova-forms";

export function ApplicationForm({ session }: { session: SessionIdentity }) {
  const [categoryId, setCategoryId] = useState<string>("competitive");
  const [subtypeId, setSubtypeId] = useState<string>("main_team_or_academy");
  const [title, setTitle] = useState("Main Team / Academy Application");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const category = useMemo(() => getCategoryById(categoryId), [categoryId]);
  const subtype = useMemo(() => getSubtypeById(categoryId, subtypeId), [categoryId, subtypeId]);

  return (
    <div className="card stack">
      <div>
        <div className="tag">Application Builder</div>
        <h2 className="section-title">Submit a KOVA application</h2>
        <p className="section-subtitle">
          This is the new v2 submission flow. We can expand the forms per subtype as
          we continue rebuilding the website.
        </p>
      </div>

      {status ? <div className="notice">{status}</div> : null}

      <div className="grid grid--two">
        <Field label="Category">
          <select
            className="select"
            value={categoryId}
            onChange={(event) => {
              const nextCategory = event.target.value;
              const nextCategoryDef = getCategoryById(nextCategory);
              const nextSubtype = nextCategoryDef?.subtypes[0];
              setCategoryId(nextCategory);
              setSubtypeId(nextSubtype?.id ?? "");
              setTitle(nextSubtype?.title ? `${nextSubtype.title} Application` : "");
            }}
          >
            {applyCategories.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </Field>

        <Field label="Subtype">
          <select
            className="select"
            value={subtypeId}
            onChange={(event) => {
              const nextSubtypeId = event.target.value;
              const nextSubtypeDef = getSubtypeById(categoryId, nextSubtypeId);
              setSubtypeId(nextSubtypeId);
              setTitle(nextSubtypeDef?.title ? `${nextSubtypeDef.title} Application` : "");
            }}
          >
            {category?.subtypes.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Application Title">
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Main Team / Academy Application" />
      </Field>

      {subtype ? <div className="notice">{subtype.description}</div> : null}

      <Field label="Motivation">
        <textarea className="textarea" value={motivation} onChange={(event) => setMotivation(event.target.value)} placeholder="Why do you want to join or work with KOVA?" />
      </Field>

      <div className="grid grid--two">
        <Field label="Experience">
          <textarea className="textarea" value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="Teams, projects, results, prior work..." />
        </Field>
        <Field label="Availability">
          <textarea className="textarea" value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="Days, times, timezone, expected schedule..." />
        </Field>
      </div>

      <div className="row">
        <button
          className="button button--primary"
          disabled={submitting}
          onClick={async () => {
            if (!category || !subtype) {
              return;
            }

            setSubmitting(true);
            setStatus(null);

            try {
              await apiRequest("/applications", session, {
                method: "POST",
                body: JSON.stringify({
                  category: category.id,
                  subtype: subtype.id,
                  title,
                  submission: {
                    motivation,
                    experience,
                    availability,
                    categoryTitle: category.title,
                    subtypeTitle: subtype.title,
                  },
                }),
              });

              setStatus("Application submitted.");
              setMotivation("");
              setExperience("");
              setAvailability("");
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to submit application.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

