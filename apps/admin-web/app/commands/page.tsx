"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { SessionGate } from "../../components/session-gate";

const commandSections = [
  {
    id: "premier-announcements",
    title: "Premier Announcements",
    description:
      "Prepare and tune Premier announcement copy, structure, and rollout notes before sending them through the bot flow.",
    href: "/commands/premier-announcements",
  },
  {
    id: "tournaments",
    title: "Tournament Setup",
    description:
      "Create tournament entries, define the public-facing details, and prepare the linked info announcement flow.",
    href: "/commands/tournaments",
  },
  {
    id: "runtime-config",
    title: "Command Runtime Notes",
    description:
      "Keep command-side references, rollout notes, and handoff context in one staff-facing place while deeper bot wiring continues.",
    href: "/commands/runtime-config",
  },
] as const;

export default function CommandsPage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="tag">Command Center</div>
        <h1 className="page-title">Manage bot-facing workflows</h1>
        <p className="page-copy">
          This section is the admin home for announcement editing, tournament setup, and
          command-side operational preparation.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into command management."
        minimumAccess="admin"
      >
        {() => (
          <section className="selector-grid">
            {commandSections.map((section) => (
              <Link key={section.id} href={section.href} className="selector-card">
                <div className="tag">Admin</div>
                <h2 className="selector-card__title">{section.title}</h2>
                <p className="selector-card__description">{section.description}</p>
                <div className="selector-card__meta">Open workspace</div>
              </Link>
            ))}
          </section>
        )}
      </SessionGate>
    </AdminShell>
  );
}
