"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { ValorantRiotManager } from "../../../components/valorant-riot-manager";
import { ValorantSystemManager } from "../../../components/valorant-system-manager";
import { WebsiteWorkspace } from "../../../components/website-workspace";

export default function WebsiteMembersPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Members Page Workspace</h1>
        <p className="page-copy">
          Settle the public roster leaderboard language here while the Riot-driven data and
          roster-state engine are still being designed.
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
              section="members"
              draftTag="Members Draft"
              title="Prepare the full roster leaderboard"
              intro="Use this workspace to control the members-page framing, explain how KOVA ranks players, and keep the future Riot-data bridge visible to staff."
              fields={[
                {
                  id: "eyebrow",
                  label: "Eyebrow",
                  type: "text",
                  defaultValue: "MEMBERS",
                },
                {
                  id: "headline",
                  label: "Headline",
                  type: "text",
                  defaultValue: "KOVA MEMBERS",
                },
                {
                  id: "intro",
                  label: "Intro Copy",
                  type: "textarea",
                  defaultValue:
                    "A full leaderboard-style roster view built to become the deeper member page once real synced data is connected.",
                },
                {
                  id: "rankingNote",
                  label: "Ranking Note",
                  type: "textarea",
                  defaultValue:
                    "The leaderboard should reflect overall KOVA performance, while still allowing staff and visitors to compare category leaders like KD, win rate, or ACS.",
                },
                {
                  id: "stateModel",
                  label: "Roster State Model",
                  type: "textarea",
                  defaultValue:
                    "Players need tracked states such as main team, academy, tournament-only, Premier-active, or league-active so the data engine knows what role each player currently holds inside KOVA.",
                },
                {
                  id: "matchCaptureRule",
                  label: "Match Capture Rule",
                  type: "textarea",
                  defaultValue:
                    "The backend must only save the right matches. Not every game a player plays is useful, so KOVA needs a way to tell the system when a player is currently in a valid tracked environment such as league, Premier, tournament, or approved customs.",
                },
                {
                  id: "futureSections",
                  label: "Future Expansion Notes",
                  type: "textarea",
                  defaultValue:
                    "Season Leader\nOverall Leader\nRole-based leaders\nFull member cards\nRecent movement history",
                  hint: "Use one line per future members-page layer.",
                },
              ]}
              previewTitle="Members page direction"
              previewDescription="This preview keeps the public roster story and the future data-engine requirements connected in one place."
              previewItems={[
                { label: "Eyebrow", fieldId: "eyebrow", fallback: "MEMBERS" },
                { label: "Headline", fieldId: "headline", fallback: "KOVA MEMBERS" },
                {
                  label: "Intro Copy",
                  fieldId: "intro",
                  fallback: "No members intro drafted yet.",
                },
                {
                  label: "Ranking Note",
                  fieldId: "rankingNote",
                  fallback: "No ranking note drafted yet.",
                },
                {
                  label: "Match Capture Rule",
                  fieldId: "matchCaptureRule",
                  fallback: "No match capture rule drafted yet.",
                },
              ]}
              nextSteps={[
                "Connect this page to a real member/leaderboard data model later.",
                "Add admin controls for player states and tracked competition contexts.",
                "Use this as the bridge into the Riot engine instead of syncing every match blindly.",
              ]}
            />

            <ValorantSystemManager session={session} />
            <ValorantRiotManager session={session} />
          </div>
        )}
      </SessionGate>
    </AdminShell>
  );
}
