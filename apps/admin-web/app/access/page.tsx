"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { AccessManagement } from "../../components/access-management";
import { SessionGate } from "../../components/session-gate";

export default function AccessPage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="page-header__row">
          <div className="tag">Access Management</div>
          <Link href="/actions" className="tag tag--action">
            Back
          </Link>
        </div>
        <h1 className="page-title">Manage staff roles</h1>
        <p className="page-copy">
          This screen is the first internal workflow tool for KOVA. It covers
          the core role ladder: `mod`, `admin`, and `full`.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into access management."
      >
        {(session) => <AccessManagement session={session} />}
      </SessionGate>
    </AdminShell>
  );
}
