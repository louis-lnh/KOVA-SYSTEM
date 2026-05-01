"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type ApplicationItem = {
  id: string;
  category: string;
  subtype: string;
  title: string;
  status: "pending" | "accepted" | "rejected";
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  user: {
    discordId: string;
    username: string;
    displayName: string | null;
  };
  reviewer?: {
    username: string;
    displayName: string | null;
  } | null;
};

type ApplicationsListResponse = {
  items: ApplicationItem[];
};

const categoryOptions = [
  "all",
  "competitive",
  "staff",
  "community",
  "creative",
  "partnerships",
] as const;
const statusOptions = ["all", "pending", "accepted", "rejected"] as const;
const sortOptions = ["newest", "oldest", "recently_updated", "applicant_name"] as const;

export function ApplicationManagement({ session }: { session: SessionIdentity }) {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "all" as (typeof categoryOptions)[number],
    status: "all" as (typeof statusOptions)[number],
    archived: "active" as "active" | "archived" | "all",
    search: "",
    sort: "newest" as (typeof sortOptions)[number],
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.category !== "all") {
      params.set("category", filters.category);
    }

    if (filters.status !== "all") {
      params.set("status", filters.status);
    }

    if (filters.archived !== "all") {
      params.set("archived", filters.archived === "archived" ? "true" : "false");
    }

    const query = params.toString();
    return query ? `/applications?${query}` : "/applications";
  }, [filters.archived, filters.category, filters.status]);

  const queueStats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      reviewed: items.filter((item) => item.status !== "pending").length,
      accepted: items.filter((item) => item.status === "accepted").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    }),
    [items],
  );

  const duplicateDiscordIds = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.user.discordId, (counts.get(item.user.discordId) ?? 0) + 1);
    }

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([discordId]) => discordId),
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const nextItems = [...items];

    if (search) {
      nextItems.splice(
        0,
        nextItems.length,
        ...nextItems.filter((item) => {
          const searchBlob = [
            item.title,
            item.category,
            item.subtype,
            item.user.discordId,
            item.user.username,
            item.user.displayName ?? "",
          ]
            .join(" ")
            .toLowerCase();

          return searchBlob.includes(search);
        }),
      );
    }

    nextItems.sort((left, right) => compareApplications(left, right, filters.sort));

    return nextItems;
  }, [filters.search, filters.sort, items]);

  const pendingItems = useMemo(
    () => filteredItems.filter((item) => item.status === "pending"),
    [filteredItems],
  );

  const reviewedItems = useMemo(
    () => filteredItems.filter((item) => item.status !== "pending"),
    [filteredItems],
  );

  useEffect(() => {
    let active = true;

    async function loadList() {
      setLoadingList(true);

      try {
        const data = await adminApiRequest<ApplicationsListResponse>(queryString, session);

        if (!active) {
          return;
        }

        setItems(data.items);
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Failed to load applications.");
        }
      } finally {
        if (active) {
          setLoadingList(false);
        }
      }
    }

    void loadList();

    return () => {
      active = false;
    };
  }, [queryString, session]);

  return (
    <div className="admin-applications admin-applications--wide">
      {message ? <div className="notice notice--error">{message}</div> : null}

      <div className="admin-applications__board">
        <section className="card stack board-card board-card--queue">
          <div className="board-card__header">
            <div>
              <div className="tag">Reviewed</div>
              <h2 className="section-title">Accepted + Rejected</h2>
              <p className="section-subtitle">
                Finalized applications live here for quick re-checks and archive follow-up.
              </p>
            </div>
            <div className="board-count">{reviewedItems.length}</div>
          </div>

          {loadingList ? (
            <div className="notice">Loading applications...</div>
          ) : reviewedItems.length === 0 ? (
            <div className="notice">No reviewed applications match the current filters.</div>
          ) : (
            <div className="application-list">
              {reviewedItems.map((item) => (
                <ApplicationCard
                  key={item.id}
                  item={item}
                  duplicate={duplicateDiscordIds.has(item.user.discordId)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card stack board-card board-card--queue">
          <div className="board-card__header">
            <div>
              <div className="tag">Pending</div>
              <h2 className="section-title">Incoming Applications</h2>
              <p className="section-subtitle">
                New reports stay centered here so staff can work the queue first.
              </p>
            </div>
            <div className="board-count">{pendingItems.length}</div>
          </div>

          {loadingList ? (
            <div className="notice">Loading applications...</div>
          ) : pendingItems.length === 0 ? (
            <div className="notice">No pending applications match the current filters.</div>
          ) : (
            <div className="application-list">
              {pendingItems.map((item) => (
                <ApplicationCard
                  key={item.id}
                  item={item}
                  duplicate={duplicateDiscordIds.has(item.user.discordId)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card stack board-card board-card--filters">
          <div>
            <div className="tag">Filters</div>
            <h2 className="section-title">Queue Controls</h2>
            <p className="section-subtitle">
              Narrow the board without pushing the whole page into a cluttered layout.
            </p>
          </div>

          <div className="filter-strip">
            <div className="field">
              <label htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                className="select"
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    category: event.target.value as (typeof categoryOptions)[number],
                  }))
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                className="select"
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value as (typeof statusOptions)[number],
                  }))
                }
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="archiveFilter">Archived</label>
              <select
                id="archiveFilter"
                className="select"
                value={filters.archived}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    archived: event.target.value as "active" | "archived" | "all",
                  }))
                }
              >
                <option value="active">Active only</option>
                <option value="archived">Archived only</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="sortFilter">Sort</label>
              <select
                id="sortFilter"
                className="select"
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sort: event.target.value as (typeof sortOptions)[number],
                  }))
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="recently_updated">Recently updated</option>
                <option value="applicant_name">Applicant name</option>
              </select>
            </div>

            <div className="field filter-strip__search">
              <label htmlFor="searchFilter">Search</label>
              <input
                id="searchFilter"
                className="input"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Search title, user, Discord ID..."
              />
            </div>
          </div>

          <div className="queue-stats queue-stats--compact">
            <div className="queue-stat">
              <strong>{queueStats.total}</strong>
              <span>Total</span>
            </div>
            <div className="queue-stat">
              <strong>{queueStats.pending}</strong>
              <span>Pending</span>
            </div>
            <div className="queue-stat">
              <strong>{queueStats.reviewed}</strong>
              <span>Reviewed</span>
            </div>
            <div className="queue-stat">
              <strong>{queueStats.accepted}</strong>
              <span>Accepted</span>
            </div>
            <div className="queue-stat">
              <strong>{queueStats.rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ApplicationCard({
  item,
  duplicate,
}: {
  item: ApplicationItem;
  duplicate: boolean;
}) {
  const primaryName =
    item.user.displayName ??
    (item.user.username !== item.user.discordId ? item.user.username : item.user.discordId);

  return (
    <Link href={`/applications/${item.id}`} className="application-list__item">
      <div className="application-list__top">
        <div>
          <div className="application-list__title">{primaryName}</div>
          <div className="application-list__meta application-list__meta--spaced">
            {formatLabel(item.category)} • {formatLabel(item.subtype)}
          </div>
        </div>
        <span className={`status-badge status-badge--${item.status}`}>
          {item.status}
        </span>
      </div>

      <div className="application-list__details">
        <span>{item.user.discordId}</span>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>

      <div className="application-list__flags">
        {item.archived ? <span className="review-flag">Archived</span> : null}
        {duplicate ? <span className="review-flag review-flag--warn">Duplicate</span> : null}
        {item.reviewer ? (
          <span className="review-flag">
            Reviewed by {item.reviewer.displayName ?? item.reviewer.username}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function compareApplications(
  left: ApplicationItem,
  right: ApplicationItem,
  sort: (typeof sortOptions)[number],
) {
  switch (sort) {
    case "oldest":
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    case "recently_updated":
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    case "applicant_name":
      return (left.user.displayName ?? left.user.username).localeCompare(
        right.user.displayName ?? right.user.username,
      );
    default:
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  }
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
