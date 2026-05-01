"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type VerificationItem = {
  discordId: string;
  status:
    | "verified"
    | "review_required"
    | "denied_once"
    | "denied_twice"
    | "banned"
    | "bot_banned";
  reviewReason: string | null;
  denyCount: number;
  verifiedAt: string | null;
  verifiedBy: "system" | "staff" | null;
  updatedAt: string;
  user: {
    discordId: string;
    username: string;
    displayName: string | null;
  } | null;
};

type VerificationListResponse = {
  items: VerificationItem[];
};

const statusOptions = [
  "all",
  "verified",
  "review_required",
  "denied_once",
  "denied_twice",
  "banned",
  "bot_banned",
] as const;
const sortOptions = ["recently_updated", "oldest", "discord_name", "status"] as const;

export function VerificationManagement({ session }: { session: SessionIdentity }) {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all" as (typeof statusOptions)[number],
    search: "",
    sort: "recently_updated" as (typeof sortOptions)[number],
  });

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      setLoading(true);

      try {
        const query =
          filters.status === "all" ? "/verification" : `/verification?status=${filters.status}`;
        const data = await adminApiRequest<VerificationListResponse>(query, session);

        if (!active) {
          return;
        }

        setItems(data.items);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error ? error.message : "Failed to load verification records.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      active = false;
    };
  }, [filters.status, session]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const nextItems = [...items].filter((item) => {
      if (!search) {
        return true;
      }

      const searchBlob = [
        item.discordId,
        item.status,
        item.reviewReason ?? "",
        item.user?.username ?? "",
        item.user?.displayName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchBlob.includes(search);
    });

    nextItems.sort((left, right) => {
      switch (filters.sort) {
        case "oldest":
          return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
        case "discord_name":
          return (left.user?.displayName ?? left.user?.username ?? left.discordId).localeCompare(
            right.user?.displayName ?? right.user?.username ?? right.discordId,
          );
        case "status":
          return left.status.localeCompare(right.status);
        default:
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      }
    });

    return nextItems;
  }, [filters.search, filters.sort, items]);

  const pendingItems = useMemo(
    () =>
      filteredItems.filter((item) =>
        ["review_required", "denied_once"].includes(item.status),
      ),
    [filteredItems],
  );

  const reviewedItems = useMemo(
    () =>
      filteredItems.filter(
        (item) => !["review_required", "denied_once"].includes(item.status),
      ),
    [filteredItems],
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) =>
        ["review_required", "denied_once"].includes(item.status),
      ).length,
      verified: items.filter((item) => item.status === "verified").length,
      blocked: items.filter((item) =>
        ["denied_twice", "banned", "bot_banned"].includes(item.status),
      ).length,
    }),
    [items],
  );

  return (
    <div className="admin-applications admin-applications--wide">
      {message ? <div className="notice notice--error">{message}</div> : null}

      <div className="admin-applications__board">
        <section className="card stack board-card board-card--queue">
          <div className="board-card__header">
            <div>
              <div className="tag">Reviewed</div>
              <h2 className="section-title">Verified + Blocked</h2>
              <p className="section-subtitle">
                Records that are already resolved or no longer awaiting manual action.
              </p>
            </div>
            <div className="board-count">{reviewedItems.length}</div>
          </div>

          {loading ? (
            <div className="notice">Loading verification records...</div>
          ) : reviewedItems.length === 0 ? (
            <div className="notice">No verification records match the current filters.</div>
          ) : (
            <div className="application-list">
              {reviewedItems.map((item) => (
                <VerificationCard key={item.discordId} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="card stack board-card board-card--queue">
          <div className="board-card__header">
            <div>
              <div className="tag">Pending</div>
              <h2 className="section-title">Manual Review Queue</h2>
              <p className="section-subtitle">
                Verification cases that likely need a staff decision next.
              </p>
            </div>
            <div className="board-count">{pendingItems.length}</div>
          </div>

          {loading ? (
            <div className="notice">Loading verification records...</div>
          ) : pendingItems.length === 0 ? (
            <div className="notice">No pending verification records match the current filters.</div>
          ) : (
            <div className="application-list">
              {pendingItems.map((item) => (
                <VerificationCard key={item.discordId} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="card stack board-card board-card--filters">
          <div>
            <div className="tag">Filters</div>
            <h2 className="section-title">Verification Controls</h2>
            <p className="section-subtitle">
              Review queue filters tuned for verification states and staff follow-up.
            </p>
          </div>

          <div className="filter-strip">
            <div className="field">
              <label htmlFor="verificationStatusFilter">Status</label>
              <select
                id="verificationStatusFilter"
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
              <label htmlFor="verificationSortFilter">Sort</label>
              <select
                id="verificationSortFilter"
                className="select"
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sort: event.target.value as (typeof sortOptions)[number],
                  }))
                }
              >
                <option value="recently_updated">Recently updated</option>
                <option value="oldest">Oldest first</option>
                <option value="discord_name">Discord name</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="field filter-strip__search">
              <label htmlFor="verificationSearchFilter">Search</label>
              <input
                id="verificationSearchFilter"
                className="input"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Search Discord name, ID, or reason..."
              />
            </div>
          </div>

          <div className="queue-stats queue-stats--compact">
            <div className="queue-stat">
              <strong>{stats.total}</strong>
              <span>Total</span>
            </div>
            <div className="queue-stat">
              <strong>{stats.pending}</strong>
              <span>Pending</span>
            </div>
            <div className="queue-stat">
              <strong>{stats.verified}</strong>
              <span>Verified</span>
            </div>
            <div className="queue-stat">
              <strong>{stats.blocked}</strong>
              <span>Blocked</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function VerificationCard({ item }: { item: VerificationItem }) {
  const primaryName =
    item.user?.displayName ??
    (item.user?.username && item.user.username !== item.discordId
      ? item.user.username
      : item.discordId);

  return (
    <Link href={`/verifications/${item.discordId}`} className="application-list__item">
      <div className="application-list__top">
        <div>
          <div className="application-list__title">{primaryName}</div>
          <div className="application-list__meta application-list__meta--spaced">
            {item.discordId}
          </div>
        </div>
        <span className={`status-badge status-badge--verification-${item.status}`}>
          {formatLabel(item.status)}
        </span>
      </div>

      <div className="application-list__details">
        <span>Deny Count: {item.denyCount}</span>
        <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span>
      </div>

      {item.reviewReason ? (
        <div className="application-list__flags">
          <span className="review-flag review-flag--warn">{item.reviewReason}</span>
        </div>
      ) : null}
    </Link>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
