import { AppShell } from "../../components/app-shell";

export default function TermsPage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">Terms</div>
        <h1 className="page-title">Terms of service</h1>
        <p className="page-copy">
          These terms govern the use of the KOVA Apply website and related
          application functions.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>1. Scope</h2>
          <p>
            These terms apply to the use of KOVA Apply, including login,
            profile management, application submission, and related user-facing
            platform features.
          </p>
        </article>

        <article className="legal-card">
          <h2>2. User obligations</h2>
          <ul>
            <li>Users must provide truthful and reasonably up-to-date information.</li>
            <li>Users may not impersonate other individuals or organizations.</li>
            <li>Users may not submit abusive, misleading, spam, or fraudulent applications.</li>
            <li>Users may not attempt to interfere with platform security or access controls.</li>
          </ul>
        </article>

        <article className="legal-card">
          <h2>3. Application review</h2>
          <p>
            Submission of an application does not guarantee acceptance,
            partnership, placement, staff onboarding, or any other outcome.
            KOVA may review, reject, archive, limit, or remove applications and
            related platform access at its discretion.
          </p>
        </article>

        <article className="legal-card">
          <h2>4. Internal review access</h2>
          <p>
            Applications and related data may be reviewed internally by
            authorized KOVA staff for moderation, verification, roster review,
            staffing, partnership assessment, and other operational decisions.
          </p>
        </article>

        <article className="legal-card">
          <h2>5. Availability and changes</h2>
          <p>
            KOVA Apply is an actively developing project. Features may change,
            be restricted, or be removed at any time. Temporary downtime,
            maintenance, or technical interruptions may occur.
          </p>
        </article>

        <article className="legal-card">
          <h2>6. Contact</h2>
          <p>
            Questions about these terms or platform-related support requests can
            be sent to support@kova-esports.com.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
