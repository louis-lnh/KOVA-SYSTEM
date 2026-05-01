import { AppShell } from "../../components/app-shell";

export default function PrivacyPage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">Privacy</div>
        <h1 className="page-title">Privacy policy</h1>
        <p className="page-copy">
          This privacy policy explains how KOVA Apply processes personal data in
          connection with login, profiles, and applications.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>1. Controller</h2>
          <p>
            The controller responsible for this website and the related data
            processing is Louis Lenhartz, An der Burg Suelz 27a, 53797 Lohmar,
            Nordrhein-Westfalen, Germany. Contact: info@kova-esports.com.
            Privacy and support requests can also be sent to
            support@kova-esports.com.
          </p>
        </article>

        <article className="legal-card">
          <h2>2. Categories of data</h2>
          <ul>
            <li>Discord account data used for login and account linking.</li>
            <li>Profile data entered by users in the KOVA Apply platform.</li>
            <li>Application answers, role details, and related submission metadata.</li>
            <li>Internal review information such as status changes, notes, and access control metadata.</li>
            <li>Technical logs required for security, error handling, and service stability.</li>
          </ul>
        </article>

        <article className="legal-card">
          <h2>3. Purposes and legal basis</h2>
          <p>
            Personal data is processed to provide login and account functions,
            accept and review applications, operate internal staff workflows,
            manage access permissions, and protect the platform from abuse or
            misuse. Processing is generally based on legitimate interests in
            operating the project and, where applicable, on steps taken at the
            request of the user before a potential team, staff, or partnership
            relationship.
          </p>
        </article>

        <article className="legal-card">
          <h2>4. Recipients and services</h2>
          <p>
            Data may be accessible to authorized KOVA staff who need it for
            review and moderation workflows. The platform also relies on third
            party services and infrastructure used for authentication,
            application handling, hosting, databases, and related operational
            functions. At the current stage, this can include Discord and the
            KOVA backend/database stack. Additional Riot Games-related data
            processing may be added later if the public data features are built
            out.
          </p>
        </article>

        <article className="legal-card">
          <h2>5. Retention</h2>
          <p>
            Personal data is stored only as long as it is required for account
            management, application review, internal moderation, security, or
            legal obligations. Because KOVA is still an actively developing
            project, some data may be retained for a reasonable period to keep
            application history and staff decisions consistent unless deletion
            is required.
          </p>
        </article>

        <article className="legal-card">
          <h2>6. Data subject rights</h2>
          <p>
            Users may request information about their stored personal data and
            may request correction or deletion where legally applicable. Requests
            can be sent to support@kova-esports.com. KOVA will review each
            request in light of operational needs, security requirements, and
            any legal retention duties.
          </p>
        </article>

        <article className="legal-card">
          <h2>7. Cookies and analytics</h2>
          <p>
            KOVA Apply currently does not rely on separate analytics or
            non-essential tracking cookies by design. The platform may still use
            technically necessary session or authentication-related storage to
            keep login and application functions working correctly.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
