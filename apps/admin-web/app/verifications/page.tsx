"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { SessionGate } from "../../components/session-gate";
import { VerificationManagement } from "../../components/verification-management";

export default function VerificationsPage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="page-header__row">
          <div className="tag">Verification Review</div>
          <Link href="/actions" className="tag tag--action">
            Back
          </Link>
        </div>
        <h1 className="page-title">Review manual verification cases</h1>
        <p className="page-copy">
          Mods, admins, and full-access users can inspect verification records and handle
          cases that need staff decisions.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into verification review."
      >
        {(session) => <VerificationManagement session={session} />}
      </SessionGate>
    </AdminShell>
  );
}
