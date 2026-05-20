"use client";

import Link from "next/link";
import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { TournamentManagement } from "../../../components/tournament-management";

export default function TournamentsCommandPage() {
  return (
    <AdminShell>
      <section className="page-header">
        <div className="page-header__row">
          <div className="tag">Tournament Setup</div>
          <Link href="/commands" className="tag tag--action">
            Back
          </Link>
        </div>
        <h1 className="page-title">Run the tournament workflow</h1>
        <p className="page-copy">
          Create tournament records, keep the public-facing details together, and queue
          Discord announcements from the same admin workspace.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into tournament setup."
        minimumAccess="admin"
      >
        {(session) => <TournamentManagement session={session} />}
      </SessionGate>
    </AdminShell>
  );
}
