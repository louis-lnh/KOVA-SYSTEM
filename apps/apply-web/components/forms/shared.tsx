"use client";

import type { SessionIdentity } from "../../lib/api";

export function FormField({
  label,
  hint,
  labelNote,
  children,
}: {
  label: string;
  hint?: string;
  labelNote?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label">
        <span>{label}</span>
        {labelNote ? <span className="field__label-note">{labelNote}</span> : null}
      </label>
      {hint ? <div className="field-hint">{hint}</div> : null}
      {children}
    </div>
  );
}

export function AccountSummary({
  session,
}: {
  session: SessionIdentity | null;
}) {
  if (!session) {
    return null;
  }

  return (
    <section className="stack compact-panel">
      <h2 className="section-title">Account</h2>
      <div className="grid grid--two">
        <FormField label="Discord Username">
          <input className="input" value={session.username} disabled />
        </FormField>
        <FormField label="Discord ID">
          <input className="input" value={session.discordId} disabled />
        </FormField>
      </div>
    </section>
  );
}

export function AgentSelector({
  selectedAgents,
  onToggle,
  options,
}: {
  selectedAgents: string[];
  onToggle: (agent: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="field">Main Agents (max 3)</label>
      <div className="pill-row">
        {options.map((agent) => {
          const active = selectedAgents.includes(agent);

          return (
            <button
              key={agent}
              type="button"
              className={`pill ${active ? "pill--active" : ""}`}
              onClick={() => onToggle(agent)}
            >
              {agent}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function normalizeList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toNullable(value: string) {
  return value.trim() ? value.trim() : null;
}
