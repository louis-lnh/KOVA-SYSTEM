import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { getCategoryById, getSubtypePath } from "../../../lib/kova-forms";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryData = getCategoryById(category);

  if (!categoryData) {
    notFound();
  }

  return (
    <AppShell>
      <section className="page-header">
        <div className="page-header__row">
          <div className="tag">{categoryData.title}</div>
          <Link href="/forms" className="tag tag--action">
            Back
          </Link>
        </div>
        <h1 className="page-title">Select a form type</h1>
        <p className="page-copy">
          {categoryData.description} Choose the form that matches what you want
          to apply for.
        </p>
      </section>

      <section className="selector-grid">
        {categoryData.subtypes.map((subtype) => (
          <Link
            key={subtype.id}
            href={getSubtypePath(categoryData.id, subtype.id)}
            className={`selector-card ${subtype.status !== "live" ? "selector-card--muted" : ""}`}
          >
            <div className="selector-card__header">
              <div className="tag">{subtype.status}</div>
              <span
                className={`selector-status selector-status--${subtype.status}`}
              >
                {subtype.status === "locked"
                  ? "Locked"
                  : "Open"}
              </span>
            </div>
            <h2 className="selector-card__title">{subtype.title}</h2>
            <p className="selector-card__description">{subtype.description}</p>
            <div className="selector-card__meta">
              {subtype.status === "locked"
                ? "Open form and check eligibility"
                : "Open form"}
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
