import Link from "next/link";
import { AppShell } from "../components/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="landing-hero">
        <div className="landing-hero__inner">
          <div className="landing-hero__eyebrow-box">KOVA ESPORTS</div>
          <h1 className="landing-hero__title">KOVA APPLY</h1>
          <p className="landing-hero__copy">
            Official KOVA application platform for competitive players, Premier
            teams, tournament registrations, staff roles, and future community
            or creative opportunities.
          </p>
          <div className="landing-hero__actions">
            <Link className="button button--primary" href="/forms">
              Open Forms
            </Link>
            <Link className="button button--secondary" href="/api/auth/discord?next=/forms">
              Login with Discord
            </Link>
            <a
              className="button button--secondary"
              href="https://kova-esports.com"
            >
              Main Website
            </a>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
