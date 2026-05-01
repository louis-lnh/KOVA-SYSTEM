"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { WebsiteWorkspace } from "../../../components/website-workspace";

export default function WebsiteLandingPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Landing Page Workspace</h1>
        <p className="page-copy">
          Shape the public homepage hero, button stack, and first-impression copy here.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into website content management."
        minimumAccess="admin"
      >
        {(session) => (
          <WebsiteWorkspace
            session={session}
            section="landing"
            draftTag="Landing Draft"
            title="Prepare the homepage hero"
            intro="Use this space to control the KOVA homepage identity without reopening code every time the public message shifts."
            fields={[
              {
                id: "eyebrow",
                label: "Eyebrow",
                type: "text",
                defaultValue: "KOVA ESPORTS",
              },
              {
                id: "sideLabel",
                label: "Side Label",
                type: "text",
                defaultValue: "PREMIUM COMPETITIVE IDENTITY",
              },
              {
                id: "headline",
                label: "Headline",
                type: "text",
                defaultValue: "KOVA",
              },
              {
                id: "intro",
                label: "Intro Copy",
                type: "textarea",
                defaultValue:
                  "KOVA is building a sharper public-facing esports identity around strong teams, competitive structure, and a brand that deserves to be seen.",
              },
              {
                id: "primaryLabel",
                label: "Primary Button Label",
                type: "text",
                defaultValue: "View Team",
              },
              {
                id: "secondaryLabel",
                label: "About Button Label",
                type: "text",
                defaultValue: "About",
              },
              {
                id: "eventsLabel",
                label: "Events Button Label",
                type: "text",
                defaultValue: "Events",
              },
              {
                id: "applyLabel",
                label: "Apply Button Label",
                type: "text",
                defaultValue: "Apply",
              },
            ]}
            previewTitle="Homepage hero preview"
            previewDescription="This keeps the landing page voice easy to iterate on while the visual layer stays stable."
            previewItems={[
              { label: "Eyebrow", fieldId: "eyebrow", fallback: "KOVA ESPORTS" },
              {
                label: "Side Label",
                fieldId: "sideLabel",
                fallback: "PREMIUM COMPETITIVE IDENTITY",
              },
              { label: "Headline", fieldId: "headline", fallback: "KOVA" },
              {
                label: "Intro Copy",
                fieldId: "intro",
                fallback: "No landing intro drafted yet.",
              },
              {
                label: "Primary Button",
                fieldId: "primaryLabel",
                fallback: "View Team",
              },
            ]}
            nextSteps={[
              "Keep the homepage hero copy easy to update from admin.",
              "Later: add optional legitimacy/support lines or CTA routing controls.",
              "Later: support landing sections beyond the hero if the homepage expands.",
            ]}
          />
        )}
      </SessionGate>
    </AdminShell>
  );
}
