"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import type { SessionIdentity } from "../lib/api";

export function SessionGate({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: (session: SessionIdentity) => React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="notice">Checking your session...</div>;
  }

  if (!session) {
    return (
      <div className="card stack">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{copy}</p>
        <div className="row">
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

  return <>{children(session)}</>;
}
