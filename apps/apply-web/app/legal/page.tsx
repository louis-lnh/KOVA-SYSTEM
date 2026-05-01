import Link from "next/link";
import { AppShell } from "../../components/app-shell";

export default function LegalPage() {
  return (
    <AppShell>
      <section className="page-header">
        <div className="tag">Legal</div>
        <h1 className="page-title">Legal information</h1>
        <p className="page-copy">
          Central legal overview for KOVA Apply. Use the dedicated pages below
          for full details on imprint, privacy handling, and platform terms.
        </p>
      </section>

      <section className="legal-grid">
        <article className="legal-card">
          <h2>Imprint</h2>
          <p>
            The imprint page contains the operator details, legal contact
            information, and publication responsibility for KOVA Apply.
          </p>
          <Link className="button button--secondary" href="/imprint">
            Open Imprint
          </Link>
        </article>

        <article className="legal-card">
          <h2>Privacy Policy</h2>
          <p>
            The privacy policy explains which account and application data is
            processed, why it is processed, and how users can request changes or
            deletion where applicable.
          </p>
          <Link className="button button--secondary" href="/privacy">
            Open Privacy Policy
          </Link>
        </article>

        <article className="legal-card">
          <h2>Terms of Service</h2>
          <p>
            The terms define how KOVA Apply may be used, what applicants are
            responsible for when submitting information, and how KOVA may review
            or remove submissions.
          </p>
          <Link className="button button--secondary" href="/terms">
            Open Terms
          </Link>
        </article>
      </section>
    </AppShell>
  );
}
