import Link from "next/link";
import { MainShell } from "../components/main-shell";
import { getWebsiteSection } from "../lib/website-content";

export default async function HomePage() {
  const content = await getWebsiteSection("landing");

  const eyebrow = content?.eyebrow || "KOVA ESPORTS";
  const sideLabel = content?.sideLabel || "PREMIUM COMPETITIVE IDENTITY";
  const headline = content?.headline || "KOVA";
  const intro =
    content?.intro ||
    "KOVA is building a sharper public-facing esports identity around strong teams, competitive structure, and a brand that deserves to be seen.";
  const primaryLabel = content?.primaryLabel || "View Team";
  const secondaryLabel = content?.secondaryLabel || "About";
  const eventsLabel = content?.eventsLabel || "Events";
  const applyLabel = content?.applyLabel || "Apply";

  return (
    <MainShell>
      <section className="main-hero">
        <div className="main-hero__inner">
          <div className="main-hero__eyebrow-wrap">
            <span className="hero-eyebrow">{eyebrow}</span>
            <span className="hero-side-label">{sideLabel}</span>
          </div>

          <h1 className="main-hero__title">{headline}</h1>

          <p className="main-hero__copy">{intro}</p>

          <div className="main-hero__actions">
            <Link className="button button--primary" href="/team">
              {primaryLabel}
            </Link>
            <Link className="button button--secondary" href="/about">
              {secondaryLabel}
            </Link>
            <Link className="button button--secondary" href="/events">
              {eventsLabel}
            </Link>
            <Link className="button button--secondary" href="/apply">
              {applyLabel}
            </Link>
          </div>
        </div>
      </section>
    </MainShell>
  );
}
