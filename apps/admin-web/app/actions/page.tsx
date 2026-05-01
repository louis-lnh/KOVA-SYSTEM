"use client";

import Link from "next/link";
import { AdminShell } from "../../components/admin-shell";
import { SessionGate } from "../../components/session-gate";
import { adminActionCategories, hasRequiredAccess } from "../../lib/admin-actions";

export default function ActionsPage() {
  return (
    <AdminShell>
      <section className="page-header page-header--centered">
        <div className="tag">Admin Actions</div>
        <h1 className="page-title">Choose a category</h1>
        <p className="page-copy">
          The admin panel is split into main categories so staff can quickly
          jump into the workflow they actually need.
        </p>
      </section>

      <SessionGate
        title="Login required"
        copy="Connect your Discord account to continue into admin actions."
      >
        {(session) => (
          <section className="selector-grid selector-grid--categories">
            {adminActionCategories.map((category) => {
              const allowed = hasRequiredAccess(session.accessLevel, category.minimumAccess);
              const href = category.href;
              const live = category.status === "live" && allowed && Boolean(href);

              return live ? (
                <Link
                  key={category.id}
                  href={href!}
                  className="selector-card"
                >
                  <div className="tag">{category.minimumAccess}</div>
                  <h2 className="selector-card__title">{category.title}</h2>
                  <p className="selector-card__description">{category.description}</p>
                  <div className="selector-card__meta">Open category</div>
                </Link>
              ) : (
                <div key={category.id} className="selector-card selector-card--disabled">
                  <div className="tag">{category.minimumAccess}</div>
                  <h2 className="selector-card__title">{category.title}</h2>
                  <p className="selector-card__description">{category.description}</p>
                  <div className="selector-card__meta">
                    {allowed ? "Not live yet" : `Requires ${category.minimumAccess}`}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </SessionGate>
    </AdminShell>
  );
}
