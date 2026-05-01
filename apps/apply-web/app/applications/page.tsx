"use client";

import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { SessionGate } from "../../components/session-gate";
import { MyApplications } from "../../components/my-applications";

export default function ApplicationsPage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">My Applications</div>
        <h1 className="page-title">Track your application status</h1>
        <p className="page-copy">
          Review every application you have submitted and keep track of its
          current status.
        </p>
      </section>

      <SessionGate
        title="Log in to view your applications"
        copy="You need to connect your Discord account before we can show your saved application history."
      >
        {(session) => <MyApplications session={session} />}
      </SessionGate>

      <div className="row" style={{ marginTop: "1rem" }}>
        <Link className="button button--secondary" href="/forms">
          Back to Forms
        </Link>
      </div>
    </AppShell>
  );
}
