import { MainShell } from "../../components/main-shell";
import { getWebsiteEvents, getWebsiteSection } from "../../lib/website-content";

type WebsiteEvent = Awaited<ReturnType<typeof getWebsiteEvents>>[number];

const premierWeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getEventTimestamp(event: WebsiteEvent) {
  return event.startsAt ? new Date(event.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
}

function pickNextEvent(items: WebsiteEvent[]) {
  const now = Date.now();
  const visible = [...items].sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b));
  const highlightedUpcoming = visible.find(
    (item) => item.highlight && item.startsAt && new Date(item.startsAt).getTime() >= now,
  );
  const upcoming = visible.find(
    (item) => item.startsAt && new Date(item.startsAt).getTime() >= now,
  );

  return highlightedUpcoming ?? upcoming ?? visible.find((item) => item.highlight) ?? visible[0] ?? null;
}

function getPanelChip(event: WebsiteEvent | null, fallback: string) {
  if (!event) {
    return fallback;
  }

  return event.metadata.eventLabel || event.category.toUpperCase();
}

function getScheduleLine(event: WebsiteEvent) {
  if (event.category === "premier") {
    if (event.metadata.daysMode === "all_week") {
      return `Scheduled days: ${premierWeekDays.join(", ")}`;
    }

    if (event.metadata.daysMode === "selected_days" && event.metadata.selectedDays) {
      return `Scheduled days: ${event.metadata.selectedDays}`;
    }
  }

  if (event.startsAt) {
    return `Starts: ${new Date(event.startsAt).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return null;
}

function getEventSupportLines(event: WebsiteEvent) {
  return [event.metadata.seasonTag, getScheduleLine(event), event.metadata.participationNote].filter(
    Boolean,
  ) as string[];
}

export default async function EventsPage() {
  const content = await getWebsiteSection("events");
  const items = await getWebsiteEvents();

  const eyebrow = content?.eyebrow || "EVENTS";
  const headline = content?.headline || "KOVA EVENTS";
  const intro =
    content?.intro ||
    "This page is the dedicated home for the next event layer. It can begin as a curated schedule and later evolve into live match and tracker-fed modules.";
  const nextEventLabel = content?.nextEventLabel || "Next Event";
  const fallback =
    content?.fallback ||
    "No public event is scheduled right now. The next visible block will appear once a Premier day, tournament, or league window is added.";

  const nextEvent = pickNextEvent(items);
  const otherEvents = nextEvent ? items.filter((item) => item.id !== nextEvent.id) : items;

  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">{eyebrow}</span>
        <h1 className="page-hero__title">{headline}</h1>
        <p className="page-hero__copy">{intro}</p>
      </section>

      <section className="page-stack page-stack--centered">
        <article className="feature-panel feature-panel--wide feature-panel--centered">
          <span className="panel-chip panel-chip--centered">{getPanelChip(nextEvent, nextEventLabel)}</span>
          <h3>{nextEvent?.title ?? "No Event Scheduled"}</h3>
          <p>{nextEvent?.summary ?? fallback}</p>
          {nextEvent ? (
            <div className="stack stack--tight">
              {getEventSupportLines(nextEvent).map((line) => (
                <p className="field-hint" key={line}>
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      {otherEvents.length > 0 ? (
        <section className="page-grid">
          {otherEvents.map((event) => (
            <article className="feature-panel feature-panel--centered" key={event.id}>
              <span className="panel-chip panel-chip--centered">
                {getPanelChip(event, event.category.toUpperCase())}
              </span>
              <h3>{event.title}</h3>
              <p>{event.summary}</p>
              <div className="stack stack--tight">
                {getEventSupportLines(event).map((line) => (
                  <p className="field-hint" key={line}>
                    {line}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="page-stack page-stack--centered">
          <article className="feature-panel feature-panel--centered">
            <span className="panel-chip panel-chip--centered">WAITING</span>
            <h3>More events will appear here</h3>
            <p>{fallback}</p>
          </article>
        </section>
      )}
    </MainShell>
  );
}
