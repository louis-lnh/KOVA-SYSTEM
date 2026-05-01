"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type VerificationRecord = {
  discordId: string;
  status:
    | "verified"
    | "review_required"
    | "denied_once"
    | "denied_twice"
    | "banned"
    | "bot_banned";
  reviewReason: string | null;
  denyCount: number;
  verifiedAt: string | null;
  verifiedBy: "system" | "staff" | null;
  updatedAt: string;
  user: {
    discordId: string;
    username: string;
    displayName: string | null;
    avatarUrl?: string | null;
  } | null;
};

type VerificationRecordResponse = {
  record: VerificationRecord | null;
};

type VerificationDecisionResponse = {
  record: VerificationRecord;
  effect: string;
};

export function VerificationReview({
  session,
  discordId,
}: {
  session: SessionIdentity;
  discordId: string;
}) {
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    decision: "approve" as "approve" | "deny",
    reason: "",
  });

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      setLoading(true);

      try {
        const data = await adminApiRequest<VerificationRecordResponse>(
          `/verification/${discordId}`,
          session,
        );

        if (!active) {
          return;
        }

        setRecord(data.record);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Failed to load verification record.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRecord();

    return () => {
      active = false;
    };
  }, [discordId, session]);

  async function applyDecision() {
    if (!record) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const data = await adminApiRequest<VerificationDecisionResponse>(
        "/verification/decision",
        session,
        {
          method: "POST",
          body: JSON.stringify({
            discordId: record.discordId,
            decision: draft.decision,
            reason: draft.reason || null,
          }),
        },
      );

      setRecord(data.record);
      setMessage(`Decision applied. Discord-side effect: ${data.effect}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to apply decision.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="notice">Loading verification record...</div>;
  }

  if (!record) {
    return <div className="notice notice--error">{message ?? "Verification record not found."}</div>;
  }

  return (
    <div className="review-page stack">
      <div className="review-page__topbar">
        <div>
          <div className="tag">Verification Review</div>
          <h1 className="page-title review-page__title">
            {record.user?.displayName ?? record.user?.username ?? record.discordId}
          </h1>
          <p className="page-copy">
            Review the verification record and apply a manual decision when the automated
            flow is not enough.
          </p>
        </div>
        <Link className="button button--secondary review-page__back" href="/verifications">
          Back to Queue
        </Link>
      </div>

      {message ? (
        <div className={message.startsWith("Decision applied") ? "notice" : "notice notice--error"}>
          {message}
        </div>
      ) : null}

      <div className="review-layout">
        <aside className="card stack review-panel review-panel--meta">
          <div className="review-panel__chip">Overview</div>
          <div className="detail-list">
            <DetailItem label="Discord Name">
              {record.user?.displayName ?? record.user?.username ?? "Unknown"}
            </DetailItem>
            <DetailItem label="Discord ID">{record.discordId}</DetailItem>
            <DetailItem label="Status">
              <span className={`status-badge status-badge--verification-${record.status}`}>
                {formatLabel(record.status)}
              </span>
            </DetailItem>
            <DetailItem label="Deny Count">{record.denyCount}</DetailItem>
            <DetailItem label="Verified By">{record.verifiedBy ?? "N/A"}</DetailItem>
            <DetailItem label="Verified At">
              {record.verifiedAt ? new Date(record.verifiedAt).toLocaleString() : "N/A"}
            </DetailItem>
            <DetailItem label="Updated">
              {new Date(record.updatedAt).toLocaleString()}
            </DetailItem>
          </div>
        </aside>

        <section className="card stack review-panel review-panel--content">
          <div className="review-panel__chip">Verification</div>

          <div className="stack">
            <h2 className="section-title">Record Summary</h2>
            <div className="submission-data">
              <div className="submission-data__item">
                <div className="detail-block__label">Current State</div>
                <div>{formatLabel(record.status)}</div>
              </div>
              <div className="submission-data__item">
                <div className="detail-block__label">Review Reason</div>
                <div>{record.reviewReason || "N/A"}</div>
              </div>
              <div className="submission-data__item">
                <div className="detail-block__label">Manual Review Notes</div>
                <div>
                  This is the first operational outline for verification review. The next pass
                  can add richer audit history, Discord-side sync health, and linked staff logs.
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="card stack review-panel review-panel--actions">
          <div className="review-panel__chip">Actions</div>
          <div className="stack review-actions__intro">
            <h2 className="section-title">Decision Controls</h2>
            <p className="section-subtitle">
              Apply a manual approve or deny decision to the selected verification record.
            </p>
          </div>

          <div className="field">
            <label htmlFor="verificationDecision">Decision</label>
            <select
              id="verificationDecision"
              className="select"
              value={draft.decision}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  decision: event.target.value as "approve" | "deny",
                }))
              }
            >
              <option value="approve">Approve</option>
              <option value="deny">Deny</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="verificationReason">Reason</label>
            <textarea
              id="verificationReason"
              className="textarea"
              value={draft.reason}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
              placeholder="Why is this decision being made?"
            />
          </div>

          <div className="row">
            <button
              type="button"
              className="button button--primary"
              disabled={saving}
              onClick={applyDecision}
            >
              {saving ? "Applying..." : "Apply Decision"}
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

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
