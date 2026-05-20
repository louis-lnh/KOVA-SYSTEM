"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { AuditLogViewer } from "../../components/audit-log-viewer";
import { SessionGate } from "../../components/session-gate";

export default function AuditPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="page-header__row">
          <div className="tag">Audit Logs</div>
          <Link href="/actions" className="tag tag--action">
            Back
          </Link>
        </div>
        <h1 className="page-title">System activity</h1>
        <p className="page-copy">
          Review staff actions, Discord bot backend events, OAuth activity,
          Valorant sync work, and content changes from one place.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to view audit logs."
      >
        {(session) =>
          session.accessLevel === "admin" || session.accessLevel === "full" ? (
            <AuditLogViewer session={session} />
          ) : (
            <div className="card stack">
              <h2 className="section-title">Admin Access Required</h2>
              <p className="section-subtitle">
                Audit logs are available to admin and full access users.
              </p>
            </div>
          )
        }
      </SessionGate>
    </AdminShell>
  );
}
