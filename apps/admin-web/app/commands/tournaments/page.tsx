"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";

export default function TournamentsCommandPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Tournament Setup</div>
        <h1 className="page-title">Create tournament-ready info</h1>
        <p className="page-copy">
          This workspace is the first admin outline for tournament creation and the linked
          information announcement flow you described.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into tournament setup."
        minimumAccess="admin"
      >
        {() => (
          <div className="grid grid--two">
            <section className="card stack">
              <div className="tag">Tournament Entry</div>
              <div className="field">
                <label htmlFor="tournamentTitle">Tournament Name</label>
                <input id="tournamentTitle" className="input" placeholder="KOVA Summer Cup" />
              </div>
              <div className="field">
                <label htmlFor="tournamentSlug">Slug</label>
                <input id="tournamentSlug" className="input" placeholder="kova-summer-cup" />
              </div>
              <div className="field">
                <label htmlFor="tournamentStatus">Status</label>
                <select id="tournamentStatus" className="select" defaultValue="upcoming">
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="tournamentDetails">Public Details</label>
                <textarea
                  id="tournamentDetails"
                  className="textarea"
                  defaultValue="Use this section for schedule, format, sign-up info, and anything that should feed into the announcement."
                />
              </div>
            </section>

            <section className="card stack">
              <div className="tag">Announcement Intent</div>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="detail-block__label">What this section is for</div>
                  <div>
                    Staff can prepare the tournament data here first, then we can wire one
                    action that creates the tournament entry and its linked info announcement.
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-block__label">Next build step</div>
                  <div>
                    Add backend tournament CRUD plus a notification/announcement action that
                    the bot can pick up and post.
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </SessionGate>
    </AdminShell>
  );
}
