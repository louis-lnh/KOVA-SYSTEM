"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type ApplicationDetail = {
  id: string;
  category: string;
  subtype: string;
  title: string;
  status: "pending" | "accepted" | "rejected";
  archived: boolean;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  submission: Record<string, unknown>;
  user: {
    discordId: string;
    username: string;
    displayName: string | null;
    profile?: {
      riotId: string | null;
      trackerUrl: string | null;
      currentRank: string | null;
      peakRank: string | null;
      mainAgents: string[];
      region: string | null;
      socialLinks: string[];
    } | null;
  };
  reviewer?: {
    username: string;
    displayName: string | null;
  } | null;
};

type ApplicationDetailResponse = {
  application: ApplicationDetail;
};

type ReviewUpdateResponse = {
  application: ApplicationDetail;
};

export function ApplicationReview({
  session,
  applicationId,
}: {
  session: SessionIdentity;
  applicationId: string;
}) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    status: "pending" as "pending" | "accepted" | "rejected",
    archived: false,
    internalNotes: "",
  });

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      setLoading(true);

      try {
        const data = await adminApiRequest<ApplicationDetailResponse>(
          `/applications/${applicationId}`,
          session,
        );

        if (!active) {
          return;
        }

        setApplication(data.application);
        setDraft({
          status: data.application.status,
          archived: data.application.archived,
          internalNotes: data.application.internalNotes ?? "",
        });
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Failed to load application.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      active = false;
    };
  }, [applicationId, session]);

  async function saveReview() {
    if (!application) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const data = await adminApiRequest<ReviewUpdateResponse>(
        `/applications/${application.id}`,
        session,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: draft.status,
            archived: draft.archived,
            internalNotes: draft.internalNotes,
          }),
        },
      );

      setApplication(data.application);
      setDraft({
        status: data.application.status,
        archived: data.application.archived,
        internalNotes: data.application.internalNotes ?? "",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save review.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="notice">Loading application...</div>;
  }

  if (!application) {
    return <div className="notice notice--error">{message ?? "Application not found."}</div>;
  }

  return (
    <div className="review-page stack">
      <div className="review-page__topbar">
        <div>
          <div className="tag">Application Review</div>
          <h1 className="page-title review-page__title">{application.title}</h1>
          <p className="page-copy">
            Review the full application, confirm staff notes, and update the application state.
          </p>
        </div>
        <Link className="button button--secondary review-page__back" href="/applications">
          Back to Queue
        </Link>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}

      <div className="review-layout">
        <aside className="card stack review-panel review-panel--meta">
          <div className="review-panel__chip">Overview</div>
          <div className="detail-list">
            <DetailItem label="Discord Name">
              {application.user.displayName ?? application.user.username}
            </DetailItem>
            <DetailItem label="Discord ID">{application.user.discordId}</DetailItem>
            <DetailItem label="Category">{formatLabel(application.category)}</DetailItem>
            <DetailItem label="Subtype">{formatLabel(application.subtype)}</DetailItem>
            <DetailItem label="Status">
              <span className={`status-tone status-tone--${application.status}`}>
                {formatLabel(application.status)}
              </span>
            </DetailItem>
            <DetailItem label="Archived">{application.archived ? "Yes" : "No"}</DetailItem>
            <DetailItem label="Submitted">
              {new Date(application.createdAt).toLocaleString()}
            </DetailItem>
            <DetailItem label="Updated">
              {new Date(application.updatedAt).toLocaleString()}
            </DetailItem>
            {application.reviewer ? (
              <DetailItem label="Reviewed By">
                {application.reviewer.displayName ?? application.reviewer.username}
              </DetailItem>
            ) : null}
            {application.reviewedAt ? (
              <DetailItem label="Reviewed At">
                {new Date(application.reviewedAt).toLocaleString()}
              </DetailItem>
            ) : null}
          </div>
        </aside>

        <section className="card stack review-panel review-panel--content">
          <div className="review-panel__chip">Application</div>

          {application.user.profile ? (
            <div className="stack">
              <h2 className="section-title">Saved Profile</h2>
              <div className="detail-grid detail-grid--profile">
                <DetailBlock label="Riot ID" value={application.user.profile.riotId} />
                <DetailBlock
                  label="Current Rank"
                  value={application.user.profile.currentRank}
                />
                <DetailBlock label="Peak Rank" value={application.user.profile.peakRank} />
                <DetailBlock label="Region" value={application.user.profile.region} />
                <DetailBlock
                  label="Tracker"
                  value={application.user.profile.trackerUrl}
                  link={application.user.profile.trackerUrl}
                />
                <DetailBlock
                  label="Main Agents"
                  value={application.user.profile.mainAgents}
                />
                <DetailBlock
                  label="Social Links"
                  value={application.user.profile.socialLinks}
                />
              </div>
            </div>
          ) : null}

          <div className="stack">
            <h2 className="section-title">Submission Data</h2>
            <div className="submission-data">
              {Object.entries(application.submission || {}).map(([key, value]) => (
                <div key={key} className="submission-data__item">
                  <div className="detail-block__label">{formatLabel(key)}</div>
                  <div>{renderValue(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="card stack review-panel review-panel--actions">
          <div className="review-panel__chip">Actions</div>
          <div className="stack review-actions__intro">
            <h2 className="section-title">Review Controls</h2>
            <p className="section-subtitle">
              Update status, archive state, and internal notes without leaving the record.
            </p>
          </div>

          <div className="field">
            <label htmlFor="reviewStatus">Status</label>
            <select
              id="reviewStatus"
              className="select"
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as "pending" | "accepted" | "rejected",
                }))
              }
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="reviewArchived">Archive State</label>
            <select
              id="reviewArchived"
              className="select"
              value={draft.archived ? "archived" : "active"}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  archived: event.target.value === "archived",
                }))
              }
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="internalNotes">Internal Notes</label>
            <textarea
              id="internalNotes"
              className="textarea"
              value={draft.internalNotes}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  internalNotes: event.target.value,
                }))
              }
              placeholder="Staff-only notes, review context, follow-up points..."
            />
          </div>

          <div className="row">
            <button
              type="button"
              className="button button--primary"
              disabled={saving}
              onClick={saveReview}
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="detail-item">
      <div className="detail-block__label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  link,
}: {
  label: string;
  value: unknown;
  link?: string | null;
}) {
  return (
    <div className="detail-block detail-block--wrap">
      <div className="detail-block__label">{label}</div>
      <div>{renderValue(value, link)}</div>
    </div>
  );
}

function renderValue(value: unknown, href?: string | null) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (href && typeof value === "string") {
    return (
      <a className="detail-link" href={href} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
