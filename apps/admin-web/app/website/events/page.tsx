"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { WebsiteWorkspace } from "../../../components/website-workspace";
import { WebsiteEventsManager } from "../../../components/website-events-manager";

export default function WebsiteEventsPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Events Content Workspace</h1>
        <p className="page-copy">
          This area prepares the public event layer before it is driven by
          Premier selections, tournament entries, and manual event additions.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into website content management."
        minimumAccess="admin"
      >
        {(session) => (
          <div className="stack">
            <WebsiteWorkspace
              session={session}
              section="events"
              draftTag="Events Draft"
              title="Prepare the event-facing public copy"
              intro="Use this space to shape the public wording around the next-event box, tournament visibility, and league participation notes."
              fields={[
                {
                  id: "eyebrow",
                  label: "Eyebrow",
                  type: "text",
                  defaultValue: "EVENTS",
                },
                {
                  id: "headline",
                  label: "Headline",
                  type: "text",
                  defaultValue: "KOVA EVENTS",
                },
                {
                  id: "intro",
                  label: "Hero Description",
                  type: "textarea",
                  defaultValue:
                    "Track KOVA's upcoming match days, tournament entries, and public competitive schedule from one clean event layer.",
                },
                {
                  id: "nextEventLabel",
                  label: "Primary Event Label",
                  type: "text",
                  defaultValue: "Next Event",
                },
                {
                  id: "fallback",
                  label: "No Event Fallback",
                  type: "textarea",
                  defaultValue:
                    "No public event is scheduled right now. The next visible block will appear once a Premier day, tournament, or league window is added.",
                },
              ]}
              previewTitle="Events page direction"
              previewDescription="This preview keeps the event-page structure readable while the actual admin-to-database event flow is still pending."
              previewItems={[
                { label: "Eyebrow", fieldId: "eyebrow", fallback: "EVENTS" },
                { label: "Headline", fieldId: "headline", fallback: "KOVA EVENTS" },
                {
                  label: "Hero Description",
                  fieldId: "intro",
                  fallback: "No event-page hero description drafted yet.",
                },
                {
                  label: "Primary Event Label",
                  fieldId: "nextEventLabel",
                  fallback: "Next Event",
                },
                {
                  label: "No Event Fallback",
                  fieldId: "fallback",
                  fallback: "No fallback drafted yet.",
                },
              ]}
              nextSteps={[
                "Map events copy to backend content storage.",
                "Connect Premier day visibility and tournament selection to the database.",
                "Later: allow quick manual event creation directly from admin.",
              ]}
            />

            <WebsiteEventsManager session={session} />
          </div>
        )}
      </SessionGate>
    </AdminShell>
  );
}
