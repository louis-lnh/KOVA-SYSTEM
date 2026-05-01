"use client";

import Link from "next/link";
import { AdminShell } from "../components/admin-shell";
import { SessionGate } from "../components/session-gate";

export default function HomePage() {
  return (
    <AdminShell>
      <section className="landing-hero">
        <div className="landing-hero__inner">
        <div className="tag">KOVA INTERNAL</div>
        <h1 className="landing-hero__title">KOVA ADMIN</h1>
        <p className="landing-hero__copy">
          Staff control panel for KOVA operations, access management, and
          application review.
        </p>

          <SessionGate
            title="Login required"
            copy="Connect your Discord account to continue into the admin panel."
          >
            {(session) => (
              <div className="landing-hero__actions">
                <Link className="button button--primary" href="/actions">
                  Open Admin Actions
                </Link>
                {session.accessLevel === "full" ? (
                  <Link className="button button--secondary" href="/access">
                    Manage Access
                  </Link>
                ) : null}
              </div>
            )}
          </SessionGate>
        </div>
      </section>
    </AdminShell>
  );
}
