"use client";

import { useEffect, useState } from "react";
import { adminApiRequest, type SessionIdentity } from "../lib/api";

type AccessItem = {
  id: string;
  level: "none" | "mod" | "admin" | "full";
  assignedAt: string;
  updatedAt: string;
  user: {
    id: string;
    discordId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

type ListResponse = {
  items: AccessItem[];
};

export function AccessManagement({ session }: { session: SessionIdentity }) {
  const [items, setItems] = useState<AccessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    discordId: "",
    level: "mod" as "mod" | "admin" | "full",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await adminApiRequest<ListResponse>("/access", session);

        if (active) {
          setItems(data.items);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Failed to load access.");
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

  if (session.accessLevel !== "full") {
    return (
      <div className="card stack">
        <h2 className="section-title">Full Access Required</h2>
        <p className="section-subtitle">
          Mods and admins can access the panel, but only `full` users can assign
          staff access levels.
        </p>
      </div>
    );
  }

  async function refreshList() {
    const data = await adminApiRequest<ListResponse>("/access", session);
    setItems(data.items);
  }

  return (
    <div className="stack">
      <div className="card stack">
        <div>
          <div className="tag">Assign Access</div>
          <h2 className="section-title">Manage staff permissions</h2>
          <p className="section-subtitle">
            Assign `mod`, `admin`, or `full` access by Discord ID.
          </p>
        </div>

        {message ? <div className="notice notice--error">{message}</div> : null}

        <div className="grid grid--two">
          <div className="field">
            <label htmlFor="discordId">Discord ID</label>
            <input
              id="discordId"
              className="input"
              value={form.discordId}
              onChange={(event) =>
                setForm((current) => ({ ...current, discordId: event.target.value }))
              }
              placeholder="123456789012345678"
            />
          </div>

          <div className="field">
            <label htmlFor="level">Access Level</label>
            <select
              id="level"
              className="select"
              value={form.level}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  level: event.target.value as "mod" | "admin" | "full",
                }))
              }
            >
              <option value="mod">mod</option>
              <option value="admin">admin</option>
              <option value="full">full</option>
            </select>
          </div>
        </div>

        <div className="row">
          <button
            className="button button--primary"
            disabled={saving}
            onClick={async () => {
              if (!form.discordId.trim()) {
                setMessage("Discord ID is required.");
                return;
              }

              setSaving(true);
              setMessage(null);

              try {
                await adminApiRequest("/access", session, {
                  method: "POST",
                  body: JSON.stringify({
                    discordId: form.discordId.trim(),
                    level: form.level,
                  }),
                });

                setForm({
                  discordId: "",
                  level: "mod",
                });
                await refreshList();
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Failed to assign access.",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Assign Access"}
          </button>
        </div>
      </div>

      <div className="card stack">
        <div>
          <div className="tag">Current Access</div>
          <h2 className="section-title">Staff access list</h2>
        </div>

        {loading ? <div className="notice">Loading access assignments...</div> : null}

        {!loading ? (
          <div className="access-list">
            {items.length === 0 ? (
              <div className="notice">No access assignments yet.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="access-item">
                  <div>
                    <div className="access-item__title">
                      {item.user.displayName ?? item.user.username}
                    </div>
                    <div className="access-item__meta">
                      {item.user.discordId} | updated{" "}
                      {new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  <span className={`access-badge access-badge--${item.level}`}>
                    {item.level}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
