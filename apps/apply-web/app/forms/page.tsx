import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { applyCategories } from "../../lib/kova-forms";

export default function FormsPage() {
  const liveCategories = applyCategories.filter((category) =>
    category.subtypes.some((subtype) => subtype.status === "live"),
  ).length;
  const liveForms = applyCategories.reduce(
    (count, category) =>
      count + category.subtypes.filter((subtype) => subtype.status === "live").length,
    0,
  );

  return (
    <AppShell>
      <section className="page-header">
        <div className="page-header__row">
          <div className="tag">Forms</div>
          <Link href="/" className="tag tag--action">
            Back
          </Link>
          <div className="inline-stats">
            <span className="inline-stat">
              <strong>{liveForms}</strong> ACTIVE
            </span>
            <span className="inline-stat">
              <strong>{liveCategories}</strong> CATEGORIES
            </span>
          </div>
        </div>
        <h1 className="page-title">Choose where you want to apply</h1>
        <p className="page-copy">
          Start with the KOVA area that fits you best and continue into the
          right form for your role or roster.
        </p>
      </section>

      <section className="selector-grid selector-grid--categories">
        {applyCategories.map((category) => (
          <Link
            key={category.id}
            href={`/forms/${category.id}`}
            className="selector-card"
          >
            <div className="selector-card__header">
              <div className="tag">{category.title}</div>
              <span className="selector-status">
                {category.subtypes.some((subtype) => subtype.status === "live")
                  ? "Active"
                  : "Closed"}
              </span>
            </div>
            <h2 className="selector-card__title">{category.title}</h2>
            <p className="selector-card__description">{category.description}</p>
            <div className="selector-card__meta">
              {category.subtypes.length} forms
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
