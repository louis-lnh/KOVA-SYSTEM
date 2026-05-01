"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { WebsiteWorkspace } from "../../../components/website-workspace";

export default function WebsiteLegalPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Legal Pages Workspace</h1>
        <p className="page-copy">
          Use this section to track final wording notes for the public legal,
          privacy, and terms pages before they move into a deeper editing flow.
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
            section="legal"
            draftTag="Legal Draft"
            title="Prepare legal wording notes"
            intro="This workspace gives staff one place to keep the public-site legal notes and later publishing considerations together."
            fields={[
              {
                id: "supportEmail",
                label: "Support Contact",
                type: "text",
                defaultValue: "support@kova-esports.com",
              },
              {
                id: "operator",
                label: "Operator Note",
                type: "text",
                defaultValue: "Louis Lenhartz",
              },
              {
                id: "privacyNote",
                label: "Privacy Reminder",
                type: "textarea",
                defaultValue:
                  "Keep the public privacy wording aligned with the current hosting setup, support contact, and real processing behavior.",
              },
              {
                id: "tosNote",
                label: "Terms Reminder",
                type: "textarea",
                defaultValue:
                  "Review the public terms whenever public features, external links, or interactive modules change.",
              },
            ]}
            previewTitle="Legal workspace notes"
            previewDescription="This is not the live legal text itself. It is the admin-side holding space for legal maintenance notes and rollout reminders."
            previewItems={[
              {
                label: "Support Contact",
                fieldId: "supportEmail",
                fallback: "No support contact noted yet.",
              },
              {
                label: "Operator Note",
                fieldId: "operator",
                fallback: "No operator note drafted yet.",
              },
              {
                label: "Privacy Reminder",
                fieldId: "privacyNote",
                fallback: "No privacy reminder drafted yet.",
              },
              {
                label: "Terms Reminder",
                fieldId: "tosNote",
                fallback: "No terms reminder drafted yet.",
              },
            ]}
            nextSteps={[
              "Later: pull current legal text into admin-managed content.",
              "Add publish history or approval tracking if needed.",
              "Keep hosting and processing language aligned with the real deployment setup.",
            ]}
          />
        )}
      </SessionGate>
    </AdminShell>
  );
}
