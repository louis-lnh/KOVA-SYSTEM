"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import type { SessionIdentity } from "../lib/api";
import { hasRequiredAccess } from "../lib/admin-actions";

export function SessionGate({
  title,
  copy,
  minimumAccess = "mod",
  children,
}: {
  title: string;
  copy: string;
  minimumAccess?: "mod" | "admin" | "full";
  children: (session: SessionIdentity) => React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="notice">Checking your admin session...</div>;
  }

  if (!session) {
    return (
      <div className="card stack no-access-card">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{copy}</p>
        <div className="row row--center">
          <Link
            className="button button--primary"
            href={`/api/auth/discord?next=${encodeURIComponent(pathname || "/")}`}
          >
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  if (!hasRequiredAccess(session.accessLevel, minimumAccess)) {
    return (
      <div className="card stack no-access-card">
        <div className="tag">No Access</div>
        <h2 className="section-title">Your account is not authorized here</h2>
        <p className="section-subtitle">
          This page requires `{minimumAccess}` access. Your current level is `
          {session.accessLevel}`.
        </p>
      </div>
    );
  }
  return <>{children(session)}</>;
}
