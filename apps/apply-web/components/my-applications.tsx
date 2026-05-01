"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type SessionIdentity } from "../lib/api";

type ApplicationItem = {
  id: string;
  category: string;
  subtype: string;
  title: string;
  status: "pending" | "accepted" | "rejected";
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApplicationsResponse = {
  items: ApplicationItem[];
};

export function MyApplications({ session }: { session: SessionIdentity }) {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiRequest<ApplicationsResponse>("/applications/me", session);

        if (active) {
          setItems(data.items);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Failed to load applications.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [session]);

  if (loading) {
    return <div className="notice">Loading your applications...</div>;
  }

  if (message) {
    return <div className="notice notice--error">{message}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card stack">
        <h2 className="section-title">No applications yet</h2>
        <p className="section-subtitle">
          Once you submit an application, its status will show up here.
        </p>
        <div className="row">
          <Link className="button button--primary" href="/forms">
            Open Forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="status-list">
      {items.map((item) => (
        <div key={item.id} className="status-card">
          <div className="status-card__top">
            <div>
              <h2 className="section-title" style={{ marginBottom: "0.4rem" }}>
                {item.title}
              </h2>
              <div className="section-subtitle" style={{ marginBottom: 0 }}>
                {formatLabel(item.category)} / {formatLabel(item.subtype)}
              </div>
            </div>

            <span className={`status-badge status-badge--${item.status}`}>
              {item.status}
            </span>
          </div>

          <div className="status-card__meta-grid">
            <div className="notice">
              Submitted {new Date(item.createdAt).toLocaleString()}
            </div>
            <div className="notice">
              Last updated {new Date(item.updatedAt).toLocaleString()}
            </div>
          </div>

          {item.archived ? (
            <div className="notice" style={{ marginTop: "0.9rem" }}>
              This application has been archived by the KOVA staff team.
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

