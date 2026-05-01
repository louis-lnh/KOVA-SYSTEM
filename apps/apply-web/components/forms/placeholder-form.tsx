import Link from "next/link";

export function PlaceholderForm({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card stack">
      <div className="tag">Coming Soon</div>
      <h1 className="page-title">{title}</h1>
      <p className="page-copy">{description}</p>
      <div className="notice">
        This form path is already planned and reserved. The final questions for
        it are still being finished.
      </div>
      <div className="row">
        <Link className="button button--secondary" href="/forms">
          Back to Forms
        </Link>
      </div>
    </div>
  );
}
