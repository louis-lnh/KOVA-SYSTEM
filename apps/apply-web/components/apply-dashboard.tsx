"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { ProfileForm } from "./profile-form";
import { ApplicationForm } from "./application-form";
import { applyCategories } from "../lib/kova-forms";

export function ApplyDashboard() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="card stack">
        <div className="tag">Login Required</div>
        <h2 className="section-title">Sign in before applying</h2>
        <p className="section-subtitle">
          The real Discord login will be wired in later. For now, continue with the
          temporary login shell so we can test the live backend flow.
        </p>
        <div className="row">
          <Link className="button button--primary" href="/login">
            Open Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="grid grid--two">
        <div className="card">
          <div className="tag">Member Flow</div>
          <h2 className="section-title">Choose your direction</h2>
          <p className="section-subtitle">
            Competitive is the most defined category today, but the v2 structure
            already supports staff, community, and creative expansions.
          </p>
          <div className="pill-row">
            {applyCategories.map((category) => (
              <span key={category.id} className="pill pill--active">
                {category.title}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="tag">Logged In</div>
          <h2 className="section-title">Session snapshot</h2>
          <p className="section-subtitle">
            Current developer session for live backend testing.
          </p>
          <div className="stack">
            <div className="notice">Discord ID: {session.discordId}</div>
            <div className="notice">Username: {session.username}</div>
          </div>
        </div>
      </div>

      <ProfileForm session={session} />
      <ApplicationForm session={session} />
    </div>
  );
}
