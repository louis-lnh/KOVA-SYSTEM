"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";

export default function PremierAnnouncementsPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Premier Announcements</div>
        <h1 className="page-title">Shape Premier announcement content</h1>
        <p className="page-copy">
          This is the first command-center workspace for Premier announcements. It gives
          staff a clear place to draft the structure and content before deeper bot syncing
          is added.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into Premier announcement management."
        minimumAccess="admin"
      >
        {() => (
          <div className="grid grid--two">
            <section className="card stack">
              <div className="tag">Announcement Draft</div>
              <div className="field">
                <label htmlFor="premierTitle">Headline</label>
                <input
                  id="premierTitle"
                  className="input"
                  defaultValue="KOVA Premier Registration"
                />
              </div>
              <div className="field">
                <label htmlFor="premierSeason">Season / Split</label>
                <input id="premierSeason" className="input" placeholder="Premier Split 3" />
              </div>
              <div className="field">
                <label htmlFor="premierBody">Main Copy</label>
                <textarea
                  id="premierBody"
                  className="textarea"
                  defaultValue="Use this area to draft the public-facing Premier announcement copy, requirements, and CTA."
                />
              </div>
              <div className="field">
                <label htmlFor="premierCta">Call To Action</label>
                <input
                  id="premierCta"
                  className="input"
                  placeholder="Apply through the KOVA system"
                />
              </div>
            </section>

            <section className="card stack">
              <div className="tag">Staff Notes</div>
              <div className="notice">
                This first pass is intentionally structured more like a command-prep workspace
                than a live bot controller. Next step can wire this into backend storage and
                eventually a bot-triggered send flow.
              </div>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="detail-block__label">Recommended Next Wiring</div>
                  <div>Backend draft storage, preview rendering, and send-to-bot action.</div>
                </div>
                <div className="detail-item">
                  <div className="detail-block__label">Useful Future Controls</div>
                  <div>Target channel, role ping, season tag, schedule, and preview embed.</div>
                </div>
              </div>
            </section>
          </div>
        )}
      </SessionGate>
    </AdminShell>
  );
}
