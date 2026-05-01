import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type WebsiteEvent = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: string | null;
  endsAt: string | null;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  metadata: Record<string, string>;
  updatedByUser?: {
    username: string;
    displayName?: string | null;
  } | null;
};

type WebsiteEventsResponse = {
  items: WebsiteEvent[];
};

type EventFormState = {
  slug: string;
  category: "premier" | "tournament" | "league" | "manual";
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  eventLabel: string;
  seasonTag: string;
  daysMode: "all_week" | "selected_days" | "single_window";
  selectedDays: string;
  participationNote: string;
};

const initialState: EventFormState = {
  slug: "",
  category: "manual",
  title: "",
  summary: "",
  startsAt: "",
  endsAt: "",
  visible: true,
  highlight: false,
  archived: false,
  eventLabel: "",
  seasonTag: "",
  daysMode: "single_window",
  selectedDays: "",
  participationNote: "",
};

export function WebsiteEventsManager({ session }: { session: SessionIdentity }) {
  const [form, setForm] = useState<EventFormState>(initialState);
  const [items, setItems] = useState<WebsiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);

    try {
      const response = await adminApiRequest<WebsiteEventsResponse>(
        "/website/events",
        session,
      );

      setItems(response.items);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load website events.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  function setField<K extends keyof EventFormState>(key: K, value: EventFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEditing(item: WebsiteEvent) {
    setEditingEventId(item.id);
    setMessage(null);
    setForm({
      slug: item.slug,
      category: item.category as EventFormState["category"],
      title: item.title,
      summary: item.summary,
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
      visible: item.visible,
      highlight: item.highlight,
      archived: item.archived,
      eventLabel: item.metadata.eventLabel ?? "",
      seasonTag: item.metadata.seasonTag ?? "",
      daysMode:
        (item.metadata.daysMode as EventFormState["daysMode"] | undefined) ??
        "single_window",
      selectedDays: item.metadata.selectedDays ?? "",
      participationNote: item.metadata.participationNote ?? "",
    });
  }

  function resetForm() {
    setEditingEventId(null);
    setForm(initialState);
  }

  async function saveEvent() {
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        slug: form.slug,
        category: form.category,
        title: form.title,
        summary: form.summary,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        visible: form.visible,
        highlight: form.highlight,
        archived: form.archived,
        metadata: {
          eventLabel: form.eventLabel,
          seasonTag: form.seasonTag,
          daysMode: form.daysMode,
          selectedDays: form.selectedDays,
          participationNote: form.participationNote,
        },
      };

      if (editingEventId) {
        await adminApiRequest(`/website/events/${editingEventId}`, session, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Event updated in backend.");
      } else {
        await adminApiRequest("/website/events", session, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Event saved to backend.");
      }

      resetForm();
      await loadEvents();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : editingEventId
            ? "Failed to update website event."
            : "Failed to save website event.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleVisibility(item: WebsiteEvent) {
    try {
      await adminApiRequest(`/website/events/${item.id}`, session, {
        method: "PATCH",
        body: JSON.stringify({ visible: !item.visible }),
      });

      await loadEvents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update event visibility.",
      );
    }
  }

  async function toggleHighlight(item: WebsiteEvent) {
    try {
      await adminApiRequest(`/website/events/${item.id}`, session, {
        method: "PATCH",
        body: JSON.stringify({ highlight: !item.highlight }),
      });

      await loadEvents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update event highlight state.",
      );
    }
  }

  async function toggleArchived(item: WebsiteEvent) {
    try {
      await adminApiRequest(`/website/events/${item.id}`, session, {
        method: "PATCH",
        body: JSON.stringify({
          archived: !item.archived,
          visible: item.archived ? true : false,
        }),
      });

      if (editingEventId === item.id && !item.archived) {
        resetForm();
      }

      await loadEvents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update archive state.",
      );
    }
  }

  async function deleteEvent(item: WebsiteEvent) {
    const confirmed = window.confirm(
      `Delete "${item.title}" permanently? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await adminApiRequest(`/website/events/${item.id}`, session, {
        method: "DELETE",
      });

      if (editingEventId === item.id) {
        resetForm();
      }

      setMessage("Event deleted from backend.");
      await loadEvents();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete website event.",
      );
    }
  }

  return (
    <div className="grid grid--two">
      <section className="card stack">
        <div>
          <div className="tag">Event Entry</div>
          <h2 className="page-title">
            {editingEventId ? "Edit website event" : "Create website event items"}
          </h2>
          <p className="page-copy">
            This manager now stores the extra event metadata the main website can use
            for Premier schedules, tournaments, league windows, and quick manual updates.
          </p>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <div className="field">
          <label htmlFor="websiteEventSlug">Slug</label>
          <input
            id="websiteEventSlug"
            className="input"
            value={form.slug}
            onChange={(event) => setField("slug", event.target.value)}
            placeholder="next-premier-day"
          />
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="websiteEventCategory">Category</label>
            <select
              id="websiteEventCategory"
              className="select"
              value={form.category}
              onChange={(event) =>
                setField(
                  "category",
                  event.target.value as EventFormState["category"],
                )
              }
            >
              <option value="manual">Manual</option>
              <option value="premier">Premier</option>
              <option value="tournament">Tournament</option>
              <option value="league">League</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="websiteEventTitle">Title</label>
            <input
              id="websiteEventTitle"
              className="input"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="KOVA Premier Match Day"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="websiteEventSummary">Summary</label>
          <textarea
            id="websiteEventSummary"
            className="textarea"
            value={form.summary}
            onChange={(event) => setField("summary", event.target.value)}
            placeholder="Short public summary for the main website event card"
          />
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="websiteEventLabel">Public Label</label>
            <input
              id="websiteEventLabel"
              className="input"
              value={form.eventLabel}
              onChange={(event) => setField("eventLabel", event.target.value)}
              placeholder="Next Event / Premier Week / Tournament Window"
            />
          </div>

          <div className="field">
            <label htmlFor="websiteEventSeasonTag">Season Tag</label>
            <input
              id="websiteEventSeasonTag"
              className="input"
              value={form.seasonTag}
              onChange={(event) => setField("seasonTag", event.target.value)}
              placeholder="Premier Stage 2 - Week 3"
            />
          </div>
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="websiteEventDaysMode">Display Mode</label>
            <select
              id="websiteEventDaysMode"
              className="select"
              value={form.daysMode}
              onChange={(event) =>
                setField("daysMode", event.target.value as EventFormState["daysMode"])
              }
            >
              <option value="single_window">Single window</option>
              <option value="all_week">All week days</option>
              <option value="selected_days">Selected days</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="websiteEventSelectedDays">Selected Days</label>
            <input
              id="websiteEventSelectedDays"
              className="input"
              value={form.selectedDays}
              onChange={(event) => setField("selectedDays", event.target.value)}
              placeholder="Mon, Wed, Fri"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="websiteEventParticipationNote">Participation Note</label>
          <textarea
            id="websiteEventParticipationNote"
            className="textarea"
            value={form.participationNote}
            onChange={(event) => setField("participationNote", event.target.value)}
            placeholder="Optional extra note for league participation or public context"
          />
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="websiteEventStartsAt">Starts At</label>
            <input
              id="websiteEventStartsAt"
              className="input"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) => setField("startsAt", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="websiteEventEndsAt">Ends At</label>
            <input
              id="websiteEventEndsAt"
              className="input"
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) => setField("endsAt", event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="websiteEventArchived">Archive State</label>
            <select
              id="websiteEventArchived"
              className="select"
              value={form.archived ? "archived" : "active"}
              onChange={(event) => setField("archived", event.target.value === "archived")}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="websiteEventVisible">Visibility</label>
            <select
              id="websiteEventVisible"
              className="select"
              value={form.visible ? "visible" : "hidden"}
              onChange={(event) => setField("visible", event.target.value === "visible")}
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="websiteEventHighlight">Highlight</label>
            <select
              id="websiteEventHighlight"
              className="select"
              value={form.highlight ? "highlighted" : "normal"}
              onChange={(event) => setField("highlight", event.target.value === "highlighted")}
            >
              <option value="normal">Normal</option>
              <option value="highlighted">Highlighted</option>
            </select>
          </div>
        </div>

        <div className="row">
          <button
            className="button button--primary"
            type="button"
            onClick={() => void saveEvent()}
            disabled={submitting}
          >
            {submitting ? "Saving..." : editingEventId ? "Save Changes" : "Create Event"}
          </button>
          {editingEventId ? (
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
          <div className="tag">Saved Events</div>
          <h2 className="page-title">Current backend entries</h2>
          <p className="page-copy">
            These are the website event entries currently stored in the backend.
          </p>
        </div>

        {loading ? (
          <div className="notice">Loading events...</div>
        ) : items.length === 0 ? (
          <div className="notice">No website events have been created yet.</div>
        ) : (
          <div className="detail-list">
            {items.map((item) => (
              <div className="detail-item" key={item.id}>
                <div className="detail-block__label">{item.title} - {item.category}</div>
                <div>{item.summary}</div>
                {item.metadata.eventLabel || item.metadata.seasonTag ? (
                  <div className="field-hint">
                    {[item.metadata.eventLabel, item.metadata.seasonTag]
                      .filter(Boolean)
                      .join(" - ")}
                  </div>
                ) : null}
                {item.metadata.daysMode || item.metadata.selectedDays ? (
                  <div className="field-hint">
                    {item.metadata.daysMode === "all_week"
                      ? "Premier display: full week"
                      : item.metadata.daysMode === "selected_days"
                        ? `Selected days: ${item.metadata.selectedDays || "None set"}`
                        : "Display: single window"}
                  </div>
                ) : null}
                {item.metadata.participationNote ? (
                  <div className="field-hint">{item.metadata.participationNote}</div>
                ) : null}
                {item.archived ? (
                  <div className="field-hint">Archived entry</div>
                ) : null}
                <div className="field-hint">
                  {item.startsAt
                    ? `Starts: ${new Date(item.startsAt).toLocaleString()}`
                    : "No start date set"}
                </div>
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
                    onClick={() => void toggleVisibility(item)}
                  >
                    {item.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => void toggleHighlight(item)}
                  >
                    {item.highlight ? "Unhighlight" : "Highlight"}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => void toggleArchived(item)}
                  >
                    {item.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => void deleteEvent(item)}
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
