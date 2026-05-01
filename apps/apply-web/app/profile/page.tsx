"use client";

import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { ProfileForm } from "../../components/profile-form";
import { SessionGate } from "../../components/session-gate";

export default function ProfilePage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">My Profile</div>
        <h1 className="page-title">Edit your saved information</h1>
        <p className="page-copy">
          Update the information linked to your KOVA applications whenever
          something changes.
        </p>
      </section>

      <SessionGate
        title="Log in to manage your profile"
        copy="Connect your Discord account before editing the information attached to your applications."
      >
        {(session) => <ProfileForm session={session} />}
      </SessionGate>

      <div className="row" style={{ marginTop: "1rem" }}>
        <Link className="button button--secondary" href="/forms">
          Back to Forms
        </Link>
      </div>
    </AppShell>
  );
}
