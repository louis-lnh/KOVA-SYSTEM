import { MainShell } from "../../components/main-shell";

export default function ImprintPage() {
  return (
    <MainShell>
      <section className="page-hero page-hero--centered">
        <span className="hero-eyebrow">IMPRINT</span>
        <h1 className="page-hero__title">IMPRINT</h1>
        <p className="page-hero__copy">
          Provider information for the current KOVA public website.
        </p>
      </section>

      <section className="page-grid page-grid--single">
        <article className="feature-panel feature-panel--centered">
          <span className="panel-chip">PROVIDER</span>
          <h3>Operator details</h3>
          <p>
            Louis Lenhartz
            <br />
            An der Burg Suelz 27a
            <br />
            53797 Lohmar
            <br />
            Nordrhein-Westfalen
            <br />
            Germany
          </p>
          <p>
            Email: info@kova-esports.com
            <br />
            Support: support@kova-esports.com
            <br />
            Phone: +49 151 10212928
          </p>
          <p>
            KOVA is currently operated as a private project and not yet as a
            separately registered legal entity.
          </p>
        </article>
      </section>
    </MainShell>
  );
}
