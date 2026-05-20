"use client";

import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type TournamentStatus = "draft" | "upcoming" | "live" | "closed" | "cancelled";

type TournamentItem = {
  id: string;
  slug: string;
  title: string;
  status: TournamentStatus;
  startsAt: string | null;
  endsAt: string | null;
  metadata: {
    publicDetails: string;
    format: string;
    eventLabel: string;
    participationNote: string;
    registrationUrl: string;
    bracketUrl: string;
    streamUrl: string;
    prizePool: string;
  };
  createdAt: string;
  updatedAt: string;
};

type TournamentResponse = {
  tournament: TournamentItem;
};

type TournamentListResponse = {
  items: TournamentItem[];
};

type FormState = {
  slug: string;
  title: string;
  status: TournamentStatus;
  startsAt: string;
  endsAt: string;
  publicDetails: string;
  format: string;
  eventLabel: string;
  participationNote: string;
  registrationUrl: string;
  bracketUrl: string;
  streamUrl: string;
  prizePool: string;
  announcementMessage: string;
};

const initialState: FormState = {
  slug: "",
  title: "",
  status: "draft",
  startsAt: "",
  endsAt: "",
  publicDetails: "",
  format: "",
  eventLabel: "",
  participationNote: "",
  registrationUrl: "",
  bracketUrl: "",
  streamUrl: "",
  prizePool: "",
  announcementMessage: "",
};

export function TournamentManagement({ session }: { session: SessionIdentity }) {
  const [items, setItems] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  async function loadTournaments() {
    setLoading(true);

    try {
      const response = await adminApiRequest<TournamentListResponse>("/tournaments", session);
      setItems(response.items);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load tournament entries.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTournaments();
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingTournamentId(null);
    setForm(initialState);
  }

  function startEditing(item: TournamentItem) {
    setEditingTournamentId(item.id);
    setMessage(null);
    setForm({
      slug: item.slug,
      title: item.title,
      status: item.status,
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
      publicDetails: item.metadata.publicDetails ?? "",
      format: item.metadata.format ?? "",
      eventLabel: item.metadata.eventLabel ?? "",
      participationNote: item.metadata.participationNote ?? "",
      registrationUrl: item.metadata.registrationUrl ?? "",
      bracketUrl: item.metadata.bracketUrl ?? "",
      streamUrl: item.metadata.streamUrl ?? "",
      prizePool: item.metadata.prizePool ?? "",
      announcementMessage: "",
    });
  }

  async function saveTournament() {
    setSubmitting(true);
    setMessage(null);

    const payload = {
      slug: form.slug,
      title: form.title,
      status: form.status,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      metadata: {
        publicDetails: form.publicDetails,
        format: form.format,
        eventLabel: form.eventLabel,
        participationNote: form.participationNote,
        registrationUrl: form.registrationUrl,
        bracketUrl: form.bracketUrl,
        streamUrl: form.streamUrl,
        prizePool: form.prizePool,
      },
    };

    try {
      if (editingTournamentId) {
        await adminApiRequest<TournamentResponse>(
          `/tournaments/${editingTournamentId}`,
          session,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
        setMessage("Tournament updated.");
      } else {
        await adminApiRequest<TournamentResponse>("/tournaments", session, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Tournament created.");
      }

      resetForm();
      await loadTournaments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save tournament.");
    } finally {
      setSubmitting(false);
    }
  }

  async function announceTournament(item: TournamentItem) {
    try {
      await adminApiRequest(`/tournaments/${item.id}/announce`, session, {
        method: "POST",
        body: JSON.stringify({
          overrideMessage: form.announcementMessage || undefined,
        }),
      });

      setMessage(`Tournament announcement queued for "${item.title}".`);

      if (editingTournamentId === item.id) {
        setField("announcementMessage", "");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to queue tournament announcement.",
      );
    }
  }

  async function deleteTournament(item: TournamentItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}" permanently? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await adminApiRequest(`/tournaments/${item.id}`, session, {
        method: "DELETE",
      });

      if (editingTournamentId === item.id) {
        resetForm();
      }

      setMessage("Tournament deleted.");
      await loadTournaments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete tournament.");
    }
  }

  return (
    <div className="grid grid--two">
      <section className="card stack">
        <div>
          <div className="tag">Tournament Entry</div>
          <h2 className="page-title">
            {editingTournamentId ? "Edit tournament workflow" : "Create tournament workflow"}
          </h2>
          <p className="page-copy">
            Build the tournament record first, then queue a Discord announcement from the
            same workspace once the information is ready.
          </p>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="tournamentTitle">Tournament Name</label>
            <input
              id="tournamentTitle"
              className="input"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="KOVA Summer Cup"
            />
          </div>
          <div className="field">
            <label htmlFor="tournamentSlug">Slug</label>
            <input
              id="tournamentSlug"
              className="input"
              value={form.slug}
              onChange={(event) => setField("slug", event.target.value)}
              placeholder="kova-summer-cup"
            />
          </div>
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="tournamentStatus">Status</label>
            <select
              id="tournamentStatus"
              className="select"
              value={form.status}
              onChange={(event) => setField("status", event.target.value as TournamentStatus)}
            >
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="tournamentFormat">Format</label>
            <input
              id="tournamentFormat"
              className="input"
              value={form.format}
              onChange={(event) => setField("format", event.target.value)}
              placeholder="Single elimination / BO3"
            />
          </div>
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="tournamentStartsAt">Starts At</label>
            <input
              id="tournamentStartsAt"
              className="input"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setField("startsAt", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tournamentEndsAt">Ends At</label>
            <input
              id="tournamentEndsAt"
              className="input"
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => setField("endsAt", event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="tournamentPublicDetails">Public Details</label>
          <textarea
            id="tournamentPublicDetails"
            className="textarea"
            value={form.publicDetails}
            onChange={(event) => setField("publicDetails", event.target.value)}
            placeholder="Schedule, rules, sign-up information, and public notes."
          />
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="tournamentEventLabel">Public Label</label>
            <input
              id="tournamentEventLabel"
              className="input"
              value={form.eventLabel}
              onChange={(event) => setField("eventLabel", event.target.value)}
              placeholder="Tournament Window / Registration Open"
            />
          </div>
          <div className="field">
            <label htmlFor="tournamentPrizePool">Prize Pool</label>
            <input
              id="tournamentPrizePool"
              className="input"
              value={form.prizePool}
              onChange={(event) => setField("prizePool", event.target.value)}
              placeholder="$500 / Glory only / TBA"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="tournamentParticipationNote">Participation Note</label>
          <textarea
            id="tournamentParticipationNote"
            className="textarea"
            value={form.participationNote}
            onChange={(event) => setField("participationNote", event.target.value)}
            placeholder="Optional note for player check-ins, eligibility, or important caveats."
          />
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="tournamentRegistrationUrl">Registration URL</label>
            <input
              id="tournamentRegistrationUrl"
              className="input"
              value={form.registrationUrl}
              onChange={(event) => setField("registrationUrl", event.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="field">
            <label htmlFor="tournamentBracketUrl">Bracket URL</label>
            <input
              id="tournamentBracketUrl"
              className="input"
              value={form.bracketUrl}
              onChange={(event) => setField("bracketUrl", event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="tournamentStreamUrl">Stream URL</label>
          <input
            id="tournamentStreamUrl"
            className="input"
            value={form.streamUrl}
            onChange={(event) => setField("streamUrl", event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <label htmlFor="tournamentAnnouncementMessage">Announcement Override</label>
          <textarea
            id="tournamentAnnouncementMessage"
            className="textarea"
            value={form.announcementMessage}
            onChange={(event) => setField("announcementMessage", event.target.value)}
            placeholder="Optional Discord-specific opener or summary override when sending the announcement."
          />
        </div>

        <div className="row">
          <button
            className="button button--primary"
            type="button"
            onClick={() => void saveTournament()}
            disabled={submitting}
          >
            {submitting ? "Saving..." : editingTournamentId ? "Save Changes" : "Create Tournament"}
          </button>
          {editingTournamentId ? (
            <button
              className="button button--secondary"
              type="button"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </section>

      <section className="card stack">
        <div>
          <div className="tag">Saved Tournaments</div>
          <h2 className="page-title">Tournament workflow queue</h2>
          <p className="page-copy">
            Manage saved tournament records and queue Discord announcements when they are ready.
          </p>
        </div>

        {loading ? (
          <div className="notice">Loading tournaments...</div>
        ) : items.length === 0 ? (
          <div className="notice">No tournament entries exist yet.</div>
        ) : (
          <div className="detail-list">
            {items.map((item) => (
              <div className="detail-item" key={item.id}>
                <div className="detail-block__label">
                  {item.title} - {item.status}
                </div>
                <div>{item.metadata.publicDetails || "No public details added yet."}</div>
                <div className="field-hint">
                  {item.startsAt
                    ? `Starts: ${new Date(item.startsAt).toLocaleString()}`
                    : "No start date set"}
                </div>
                {item.metadata.format ? (
                  <div className="field-hint">Format: {item.metadata.format}</div>
                ) : null}
                <div className="row">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => startEditing(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => void announceTournament(item)}
                  >
                    Send Announcement
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => void deleteTournament(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
