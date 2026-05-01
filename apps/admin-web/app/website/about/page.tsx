"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { WebsiteWorkspace } from "../../../components/website-workspace";

export default function WebsiteAboutPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">About Content Workspace</h1>
        <p className="page-copy">
          Shape the public KOVA identity page here before the database-backed
          editing flow is added.
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
            section="about"
            draftTag="About Draft"
            title="Prepare the public identity copy"
            intro="Use this space to settle the page headline, core positioning, and the public-facing explanation of what KOVA is building."
            fields={[
              {
                id: "eyebrow",
                label: "Eyebrow",
                type: "text",
                defaultValue: "ABOUT",
              },
              {
                id: "headline",
                label: "Headline",
                type: "text",
                defaultValue: "What KOVA Is",
              },
              {
                id: "intro",
                label: "Intro Copy",
                type: "textarea",
                defaultValue:
                  "KOVA is a competitive esports organization focused on building strong teams, clear identity, and a public structure that feels intentional from the start.",
              },
              {
                id: "pillars",
                label: "Core Pillars",
                type: "textarea",
                defaultValue:
                  "Competition\nIdentity\nGrowth",
                hint: "Use one line per pillar for now.",
              },
              {
                id: "vision",
                label: "Vision Note",
                type: "textarea",
                defaultValue:
                  "The goal is not just to exist. The goal is to matter.",
              },
            ]}
            previewTitle="Public page direction"
            previewDescription="This preview keeps the core public-site decisions visible while the final wording settles in."
            previewItems={[
              { label: "Eyebrow", fieldId: "eyebrow", fallback: "ABOUT" },
              { label: "Headline", fieldId: "headline", fallback: "What KOVA Is" },
              {
                label: "Intro Copy",
                fieldId: "intro",
                fallback: "No intro copy drafted yet.",
              },
              {
                label: "Vision Note",
                fieldId: "vision",
                fallback: "No vision note drafted yet.",
              },
            ]}
            nextSteps={[
              "Map these fields to backend content storage.",
              "Add publish-state control for live/public updates.",
              "Later: support richer section editing for pillars and CTA blocks.",
            ]}
          />
        )}
      </SessionGate>
    </AdminShell>
  );
}
