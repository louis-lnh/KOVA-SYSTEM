"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type AuditSubtype = {
  id: string;
  title: string;
  actions: string[];
};

type AuditCategory = {
  id: string;
  title: string;
  subtypes: AuditSubtype[];
};

type AuditLogItem = {
  id: string;
  category: {
    id: string;
    title: string;
  };
  subtype: {
    id: string;
    title: string;
  };
  actor: {
    discordId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: unknown;
  createdAt: string;
};

type AuditLogResponse = {
  items: AuditLogItem[];
  nextCursor: string | null;
};

type AuditCategoriesResponse = {
  items: AuditCategory[];
};

export function AuditLogViewer({ session }: { session: SessionIdentity }) {
  const [categories, setCategories] = useState<AuditCategory[]>([]);
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubtype, setActiveSubtype] = useState("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeCategoryItem = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? null,
    [activeCategory, categories],
  );

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await adminApiRequest<AuditCategoriesResponse>(
          "/audit/categories",
          session,
        );

        if (active) {
          setCategories(data.items);
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Failed to load audit categories.",
          );
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      setLoading(true);
      setMessage(null);

      try {
        const data = await fetchAuditLogs();

        if (active) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Failed to load audit logs.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      active = false;
    };
  }, [activeCategory, activeSubtype, session]);

  async function fetchAuditLogs(cursor?: string) {
    const params = new URLSearchParams({
      limit: "50",
    });

    if (activeCategory !== "all") {
      params.set("category", activeCategory);
    }

    if (activeSubtype !== "all") {
      params.set("subtype", activeSubtype);
    }

    if (cursor) {
      params.set("cursor", cursor);
    }

    return adminApiRequest<AuditLogResponse>(`/audit?${params.toString()}`, session);
  }

  async function loadMore() {
    if (!nextCursor) {
      return;
    }

    setLoadingMore(true);
    setMessage(null);

    try {
      const data = await fetchAuditLogs(nextCursor);
      setItems((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load more logs.");
    } finally {
      setLoadingMore(false);
    }
  }

  function selectCategory(categoryId: string) {
    setActiveCategory(categoryId);
    setActiveSubtype("all");
  }

  return (
    <div className="stack">
      <div className="audit-tabs" role="tablist" aria-label="Audit log categories">
        <button
          type="button"
          className={`audit-tab ${activeCategory === "all" ? "audit-tab--active" : ""}`}
          onClick={() => selectCategory("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`audit-tab ${
              activeCategory === category.id ? "audit-tab--active" : ""
            }`}
            onClick={() => selectCategory(category.id)}
          >
            {category.title}
          </button>
        ))}
      </div>

      <div className="card audit-toolbar">
        <div className="field">
          <label htmlFor="auditSubtype">Subtype</label>
          <select
            id="auditSubtype"
            className="select"
            value={activeSubtype}
            onChange={(event) => setActiveSubtype(event.target.value)}
          >
            <option value="all">All subtypes</option>
            {(activeCategoryItem?.subtypes ?? categories.flatMap((category) => category.subtypes)).map(
              (subtype) => (
                <option key={`${activeCategory}-${subtype.id}`} value={subtype.id}>
                  {subtype.title}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="audit-toolbar__hint">
          {activeCategory === "bot_oauth"
            ? "Discord bot backend, OAuth, and opt-in records live here."
            : "Use category tabs and subtypes to narrow the activity stream."}
        </div>
      </div>

      {message ? <div className="notice notice--error">{message}</div> : null}
      {loading ? <div className="notice">Loading audit logs...</div> : null}

      {!loading ? (
        <div className="audit-list">
          {items.length === 0 ? (
            <div className="notice">No audit logs found for this filter.</div>
          ) : (
            items.map((item) => <AuditLogRow key={item.id} item={item} />)
          )}
        </div>
      ) : null}

      {nextCursor ? (
        <button
          type="button"
          className="button button--secondary audit-load-more"
          disabled={loadingMore}
          onClick={() => void loadMore()}
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      ) : null}
    </div>
  );
}

function AuditLogRow({ item }: { item: AuditLogItem }) {
  return (
    <details className="audit-row">
      <summary className="audit-row__summary">
        <div className="audit-row__main">
          <div className="audit-row__badges">
            <span className="review-flag">{item.category.title}</span>
            <span className="review-flag">{item.subtype.title}</span>
          </div>
          <div className="audit-row__title">{formatAction(item.action)}</div>
          <div className="audit-row__meta">
            {formatActor(item)} | {item.targetType}:{item.targetId}
          </div>
        </div>
        <time className="audit-row__time" dateTime={item.createdAt}>
          {new Date(item.createdAt).toLocaleString()}
        </time>
      </summary>

      <div className="audit-row__details">
        <div className="detail-grid">
          <div className="detail-block">
            <div className="detail-block__label">Action</div>
            {item.action}
          </div>
          <div className="detail-block">
            <div className="detail-block__label">Actor</div>
            {formatActor(item)}
          </div>
          <div className="detail-block">
            <div className="detail-block__label">Target</div>
            {item.targetType}:{item.targetId}
          </div>
          <div className="detail-block">
            <div className="detail-block__label">Created</div>
            {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>

        <pre className="audit-row__metadata">
          {JSON.stringify(item.metadata ?? {}, null, 2)}
        </pre>
      </div>
    </details>
  );
}

function formatActor(item: AuditLogItem) {
  if (!item.actor) {
    return "system/internal";
  }

  return `${item.actor.displayName ?? item.actor.username} (${item.actor.discordId})`;
}

function formatAction(action: string) {
  return action.replaceAll(".", " / ").replaceAll("_", " ");
}
