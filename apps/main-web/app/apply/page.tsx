import Link from "next/link";
import { MainShell } from "../../components/main-shell";

const applyUrl =
  process.env.NEXT_PUBLIC_KOVA_APPLY_URL ?? "https://kova-esports-apply.com";

const categories = [
  "Competitive rosters",
  "Staff positions",
  "Community roles",
  "Creative applications",
  "Partnership requests",
];

export default function ApplyPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">APPLY</span>
        <h1 className="page-hero__title">KOVA APPLICATIONS</h1>
        <p className="page-hero__copy">
          The main website stays focused on the public KOVA identity. All role,
          roster, and partnership intake runs through the separate KOVA Apply
          platform.
        </p>
      </section>

      <section className="page-grid page-grid--single">
        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">APPLICATION PATHS</span>
          <div className="detail-pill-grid">
            {categories.map((category) => (
              <div className="detail-pill" key={category}>
                {category}
              </div>
            ))}
          </div>

          <div className="main-hero__actions main-hero__actions--compact">
            <a
              className="button button--primary"
              href={applyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open KOVA Apply
            </a>
            <Link className="button button--secondary" href="/">
              Back Home
            </Link>
          </div>
        </article>
      </section>
    </MainShell>
  );
}
