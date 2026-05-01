"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type FieldConfig =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder?: string;
      defaultValue?: string;
      hint?: string;
    }
  | {
      id: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      defaultValue?: string;
      hint?: string;
    }
  | {
      id: string;
      label: string;
      type: "select";
      defaultValue?: string;
      hint?: string;
      options: Array<{ value: string; label: string }>;
    };

type PreviewItem = {
  label: string;
  fieldId: string;
  fallback: string;
};

type WebsiteWorkspaceProps = {
  session: SessionIdentity;
  section: "landing" | "about" | "team" | "members" | "events" | "legal";
  draftTag: string;
  title: string;
  intro: string;
  fields: FieldConfig[];
  previewTitle: string;
  previewDescription: string;
  previewItems: PreviewItem[];
  nextSteps: string[];
};

type WebsiteContentResponse = {
  content: {
    section: string;
    data: Record<string, string>;
    updatedAt: string;
    updatedByUser?: {
      username: string;
      displayName?: string | null;
    } | null;
  } | null;
};

function getInitialState(fields: FieldConfig[]) {
  return Object.fromEntries(
    fields.map((field) => [field.id, field.defaultValue ?? ""]),
  ) as Record<string, string>;
}

export function WebsiteWorkspace({
  session,
  section,
  draftTag,
  title,
  intro,
  fields,
  previewTitle,
  previewDescription,
  previewItems,
  nextSteps,
}: WebsiteWorkspaceProps) {
  const initialState = useMemo(() => getInitialState(fields), [fields]);
  const [form, setForm] = useState<Record<string, string>>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updatedMeta, setUpdatedMeta] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const response = await adminApiRequest<WebsiteContentResponse>(
          `/website/content/${section}`,
          session,
        );

        if (!active) {
          return;
        }

        if (response.content?.data) {
          setForm({ ...initialState, ...response.content.data });

          const actor =
            response.content.updatedByUser?.displayName ??
            response.content.updatedByUser?.username ??
            "staff";

          setUpdatedMeta(`Last saved by ${actor}`);
        } else {
          setForm(initialState);
          setUpdatedMeta(null);
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Failed to load website content.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      active = false;
    };
  }, [initialState, section, session]);

  function setField(id: string, value: string) {
    setForm((current) => ({ ...current, [id]: value }));
  }

  async function saveDraft() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await adminApiRequest<WebsiteContentResponse>(
        `/website/content/${section}`,
        session,
        {
          method: "PUT",
          body: JSON.stringify({
            data: form,
          }),
        },
      );

      const actor =
        response.content?.updatedByUser?.displayName ??
        response.content?.updatedByUser?.username ??
        "staff";

      setUpdatedMeta(`Last saved by ${actor}`);
      setMessage("Saved to backend.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save website content.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setForm(initialState);
    setMessage("Draft reset locally. Save if you want to overwrite the backend copy.");
  }

  return (
    <div className="grid grid--two">
      <section className="card stack">
        <div>
          <div className="tag">{draftTag}</div>
          <h2 className="page-title">{title}</h2>
          <p className="page-copy">{intro}</p>
        </div>

        <div className="notice">
          This workspace now loads and saves through the backend, so the public-site
          admin drafts are no longer only stored in the browser.
        </div>

        {message ? <div className="notice">{message}</div> : null}
        {updatedMeta ? <div className="field-hint">{updatedMeta}</div> : null}

        {loading ? (
          <div className="notice">Loading saved content...</div>
        ) : (
          <>
            {fields.map((field) => (
              <div className="field" key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>
                {field.hint ? <div className="field-hint">{field.hint}</div> : null}

                {field.type === "textarea" ? (
                  <textarea
                    id={field.id}
                    className="textarea"
                    value={form[field.id] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setField(field.id, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.id}
                    className="select"
                    value={form[field.id] ?? ""}
                    onChange={(event) => setField(field.id, event.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.id}
                    className="input"
                    value={form[field.id] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setField(field.id, event.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="row">
              <button
                className="button button--primary"
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button className="button button--secondary" type="button" onClick={resetDraft}>
                Reset Draft
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card stack">
        <div>
          <div className="tag">Preview</div>
          <h2 className="page-title">{previewTitle}</h2>
          <p className="page-copy">{previewDescription}</p>
        </div>

        <div className="detail-list">
          {previewItems.map((item) => (
            <div className="detail-item" key={item.label}>
              <div className="detail-block__label">{item.label}</div>
              <div>{form[item.fieldId] || item.fallback}</div>
            </div>
          ))}
        </div>

        <div className="tag">Next Wiring</div>
        <div className="list-clean">
          {nextSteps.map((step) => (
            <div className="list-clean__item" key={step}>
              {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
