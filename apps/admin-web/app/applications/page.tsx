"use client";

import { AdminShell } from "../../components/admin-shell";
import { ApplicationManagement } from "../../components/application-management";
import { SessionGate } from "../../components/session-gate";

export default function ApplicationsPage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="tag">Application Management</div>
        <h1 className="page-title">Review incoming applications</h1>
        <p className="page-copy">
          Mods, admins, and full-access users can filter the application queue,
          open full records, and save review decisions from here.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into application management."
      >
        {(session) => <ApplicationManagement session={session} />}
      </SessionGate>
    </AdminShell>
  );
}
