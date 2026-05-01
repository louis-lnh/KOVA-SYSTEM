import Link from "next/link";
import { MainShell } from "../../components/main-shell";

const legalSections = [
  {
    href: "/imprint",
    chip: "IMPRINT",
    title: "Provider information",
    description:
      "View the public operator details and formal provider information for the current KOVA website.",
  },
  {
    href: "/privacy",
    chip: "PRIVACY",
    title: "Privacy policy",
    description:
      "Read how personal data, technical access information, and support requests are handled on the KOVA website.",
  },
  {
    href: "/terms",
    chip: "TOS",
    title: "Terms of service",
    description:
      "See the public website terms, permitted use rules, and the current availability/change notice for KOVA.",
  },
];

export default function LegalPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">LEGAL</span>
        <h1 className="page-hero__title">KOVA LEGAL</h1>
        <p className="page-hero__copy">
          This page is the public legal overview for the KOVA website. It
          groups the current imprint, privacy policy, and terms in one place.
        </p>
      </section>

      <section className="page-grid">
        {legalSections.map((section) => (
          <article className="feature-panel" key={section.href}>
            <span className="panel-chip">{section.chip}</span>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <div className="main-hero__actions main-hero__actions--compact">
              <Link className="button button--secondary" href={section.href}>
                Open page
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="page-grid page-grid--single">
        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">SUPPORT</span>
          <h3>Questions and requests</h3>
          <p>
            For legal, privacy, or data-related questions, KOVA can currently
            be reached through support@kova-esports.com.
          </p>
        </article>
      </section>
    </MainShell>
  );
}
