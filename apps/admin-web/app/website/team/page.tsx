"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { WebsiteWorkspace } from "../../../components/website-workspace";

export default function WebsiteTeamPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Team Page Workspace</h1>
        <p className="page-copy">
          Use this section to settle the public lineup framing, the lead player
          focus, and the roster-page copy that sits around the player cards.
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
            section="team"
            draftTag="Team Draft"
            title="Prepare the roster-facing story"
            intro="This is the admin-side prep area for the team page while player data, rankings, and the stat engine are still being wired."
            fields={[
              {
                id: "eyebrow",
                label: "Eyebrow",
                type: "text",
                defaultValue: "TEAM",
              },
              {
                id: "headline",
                label: "Headline",
                type: "text",
                defaultValue: "Our Team",
              },
              {
                id: "intro",
                label: "Hero Description",
                type: "textarea",
                defaultValue:
                  "A centered first look at the main KOVA lineup, with the featured player in the middle and the rest of the roster arranged around that core identity.",
              },
              {
                id: "featured",
                label: "Featured Player Rule",
                type: "text",
                defaultValue: "Recent MVP based on weighted last-5-match form.",
              },
              {
                id: "featuredNote",
                label: "Featured Player Support Note",
                type: "textarea",
                defaultValue:
                  "The middle card highlights the current standout player while the rest of the lineup stays arranged around that core identity.",
              },
              {
                id: "sectionOneTitle",
                label: "Section One Title",
                type: "text",
                defaultValue: "Current Roster Focus",
              },
              {
                id: "sectionOneCopy",
                label: "Section One Copy",
                type: "textarea",
                defaultValue:
                  "This section can later hold recent form, current role identities, and matchup-focused notes around the team.",
              },
              {
                id: "sectionTwoTitle",
                label: "Section Two Title",
                type: "text",
                defaultValue: "Stats And Highlights",
              },
              {
                id: "sectionTwoCopy",
                label: "Section Two Copy",
                type: "textarea",
                defaultValue:
                  "Tracker data, Premier results, tournament notes, and standout series can live here once the dynamic layer is ready.",
              },
              {
                id: "sectionThreeTitle",
                label: "Section Three Title",
                type: "text",
                defaultValue: "Other Team Paths",
              },
              {
                id: "sectionThreeCopy",
                label: "Section Three Copy",
                type: "textarea",
                defaultValue:
                  "Academy, Premier, or tournament-specific roster blocks can be added below the featured main lineup without crowding the first impression.",
              },
              {
                id: "sectionChip",
                label: "Lower Section Chip",
                type: "text",
                defaultValue: "NEXT LAYER",
              },
            ]}
            previewTitle="Team page direction"
            previewDescription="Keep the player-card framing and the text around it consistent while the data layer is still manual."
            previewItems={[
              { label: "Eyebrow", fieldId: "eyebrow", fallback: "TEAM" },
              { label: "Headline", fieldId: "headline", fallback: "Our Team" },
              {
                label: "Hero Description",
                fieldId: "intro",
                fallback: "No team-page hero description drafted yet.",
              },
              {
                label: "Featured Rule",
                fieldId: "featured",
                fallback: "No featured player rule drafted yet.",
              },
              {
                label: "Section One",
                fieldId: "sectionOneTitle",
                fallback: "Current Roster Focus",
              },
              {
                label: "Section Two",
                fieldId: "sectionTwoTitle",
                fallback: "Stats And Highlights",
              },
            ]}
            nextSteps={[
              "Add player ordering and badge controls.",
              "Later: connect stat, rank, and roster data from the Riot engine.",
              "Later: connect deeper roster sections or additional paths once the team layer grows.",
            ]}
          />
        )}
      </SessionGate>
    </AdminShell>
  );
}
