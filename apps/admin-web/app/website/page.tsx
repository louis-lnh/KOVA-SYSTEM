"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { SessionGate } from "../../components/session-gate";

const websiteSections = [
  {
    id: "landing",
    title: "Landing Page",
    description:
      "Control the public homepage hero, action labels, and first-impression copy without touching code.",
    href: "/website/landing",
  },
  {
    id: "about",
    title: "About Content",
    description:
      "Keep the public KOVA identity page organized and ready for the later text-editing and rollout flow.",
    href: "/website/about",
  },
  {
    id: "team",
    title: "Team Page",
    description:
      "Prepare roster-facing structure, player-card direction, and later stat-driven content integration for the team experience.",
    href: "/website/team",
  },
  {
    id: "members",
    title: "Members Page",
    description:
      "Shape the full roster leaderboard, ranking explanation, and the future Riot-data bridge around member states and valid match capture.",
    href: "/website/members",
  },
  {
    id: "events",
    title: "Events Content",
    description:
      "Manage the event-facing structure that will later connect to Premier days, tournaments, league windows, and manual entries.",
    href: "/website/events",
  },
  {
    id: "legal",
    title: "Legal Pages",
    description:
      "Keep the public legal, privacy, and terms layer in one place while the final public launch wording settles in.",
    href: "/website/legal",
  },
] as const;

export default function WebsitePage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="tag">Main Website</div>
        <h1 className="page-title">Manage public website areas</h1>
        <p className="page-copy">
          This section is the admin home for KOVA&apos;s public-site content
          slices while the deeper database and editing workflows are built out.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into main website management."
        minimumAccess="admin"
      >
        {() => (
          <section className="selector-grid selector-grid--categories">
            {websiteSections.map((section) => (
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
