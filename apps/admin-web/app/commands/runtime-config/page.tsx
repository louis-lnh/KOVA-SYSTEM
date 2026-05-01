"use client";

import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";

export default function RuntimeConfigPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="tag">Command Runtime Notes</div>
        <h1 className="page-title">Keep command-side context in one place</h1>
        <p className="page-copy">
          This page is a simple holding space for the command workflows while we continue
          turning announcement ideas into fully wired admin actions.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into command runtime notes."
        minimumAccess="admin"
      >
        {() => (
          <section className="card stack">
            <div className="tag">Next Command Targets</div>
            <div className="list-clean">
              <div className="list-clean__item">
                Premier announcement templates with send controls
              </div>
              <div className="list-clean__item">
                Tournament creation + automatic info announcement
              </div>
              <div className="list-clean__item">
                Later: channel targeting, previewing, and command history
              </div>
            </div>
          </section>
        )}
      </SessionGate>
    </AdminShell>
  );
}
