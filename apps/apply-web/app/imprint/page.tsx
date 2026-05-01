import { AppShell } from "../../components/app-shell";

export default function ImprintPage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">Imprint</div>
        <h1 className="page-title">Imprint</h1>
        <p className="page-copy">
          Provider information for the KOVA Apply platform.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>Provider</h2>
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
        </article>

        <article className="legal-card">
          <h2>Contact</h2>
          <p>
            Email: info@kova-esports.com
            <br />
            Support: support@kova-esports.com
            <br />
            Phone: +49 151 10212928
          </p>
        </article>

        <article className="legal-card">
          <h2>Responsible for content</h2>
          <p>
            Louis Lenhartz
            <br />
            Operator of the current KOVA project infrastructure
          </p>
        </article>

        <article className="legal-card">
          <h2>Status of the project</h2>
          <p>
            KOVA is currently operated as a private project and is not yet a
            separately registered company or legal entity.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
