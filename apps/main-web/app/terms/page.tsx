import { MainShell } from "../../components/main-shell";

export default function TermsPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">TOS</span>
        <h1 className="page-hero__title">TERMS OF SERVICE</h1>
        <p className="page-hero__copy">
          These terms apply to the use of the public KOVA website.
        </p>
      </section>

      <section className="page-grid page-grid--single">
        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">USE</span>
          <h3>Permitted use</h3>
          <p>
            The KOVA website is provided as a public-facing information and
            brand platform. Users may not misuse the site, attempt to interfere
            with its technical operation, or use it for unlawful, abusive, or
            fraudulent activity.
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">CONTENT</span>
          <h3>Changes and availability</h3>
          <p>
            KOVA may change, update, remove, or temporarily restrict parts of
            the site at any time. The website is an actively developing project,
            and uninterrupted availability is not guaranteed.
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">LINKS</span>
          <h3>External services</h3>
          <p>
            Where the website links to external platforms or services, the terms
            and privacy rules of those third parties apply to their own systems.
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">CONTACT</span>
          <h3>Support</h3>
          <p>
            Questions about the site or these terms can be sent to
            support@kova-esports.com.
          </p>
        </article>
      </section>
    </MainShell>
  );
}
