import { MainShell } from "../../components/main-shell";

export default function PrivacyPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">PRIVACY</span>
        <h1 className="page-hero__title">PRIVACY POLICY</h1>
        <p className="page-hero__copy">
          This privacy policy explains how the public KOVA website handles
          personal data and technical access information.
        </p>
      </section>

      <section className="page-grid page-grid--single">
        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">CONTROLLER</span>
          <h3>Responsible operator</h3>
          <p>
            Louis Lenhartz, An der Burg Suelz 27a, 53797 Lohmar,
            Nordrhein-Westfalen, Germany.
          </p>
          <p>
            Contact: info@kova-esports.com
            <br />
            Privacy and support: support@kova-esports.com
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">PROCESSING</span>
          <h3>What is processed</h3>
          <p>
            The public KOVA website mainly processes technical access data that
            is required to deliver the site securely and reliably. If direct
            contact or interactive services are added later, those functions may
            involve additional personal data processing.
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">COOKIES</span>
          <h3>Tracking and analytics</h3>
          <p>
            The site is currently intended to run without separate analytics or
            non-essential tracking by default. Technically necessary storage,
            caching, or security-related logs may still be used as part of the
            hosting and delivery process.
          </p>
        </article>

        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">RIGHTS</span>
          <h3>Questions and requests</h3>
          <p>
            Users may contact support@kova-esports.com regarding questions about
            personal data, correction requests, or deletion requests where
            legally applicable.
          </p>
        </article>
      </section>
    </MainShell>
  );
}
