"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./auth-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellInner>{children}</ShellInner>
    </AuthProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loginHref = `/api/auth/discord?next=${encodeURIComponent(pathname || "/")}`;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="site">
      <header className="navbar">
        <div className="navbar__glow" aria-hidden="true" />
        <div className="navbar__inner">
          <Link className="nav-logo" href="/">
            KOVA APPLY
          </Link>

          <nav className="nav-links">
            <Link className="nav-link" href="/forms">
              Forms
            </Link>
          </nav>

          <div className="nav-right">
            {loading ? (
              <div className="auth-chip">
                <span className="auth-name">Loading</span>
                <span className="avatar avatar--placeholder">..</span>
              </div>
            ) : session ? (
              <div className="account-menu" ref={menuRef}>
                <button
                  type="button"
                  className="account-menu__trigger"
                  onClick={() => setOpen((current) => !current)}
                >
                  <span className="auth-name">{session.username}</span>
                  <span className="avatar">
                    {session.avatarUrl ? (
                      <img alt={`${session.username} avatar`} src={session.avatarUrl} />
                    ) : (
                      session.username.slice(0, 2).toUpperCase()
                    )}
                  </span>
                </button>

                {open ? (
                  <div className="account-menu__dropdown">
                    <Link
                      className="account-menu__item"
                      href="/applications"
                      onClick={() => setOpen(false)}
                    >
                      My Applications
                    </Link>
                    <Link
                      className="account-menu__item"
                      href="/profile"
                      onClick={() => setOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      className="account-menu__item account-menu__item--button"
                      onClick={() => {
                        setOpen(false);
                        void logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link className="button button--primary" href={loginHref}>
                Login with Discord
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="shell">
        <div className="shell__inner">{children}</div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div>
            <div className="footer__label">KOVA Apply</div>
            <div className="footer__copy">{"\u00A9"} {year} KOVA Esports. All rights reserved.</div>
          </div>

          <nav className="footer__links">
            <Link className="footer__link" href="/legal">
              Legal
            </Link>
            <Link className="footer__link" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="footer__link" href="/terms">
              Terms of Service
            </Link>
            <Link className="footer__link" href="/imprint">
              Imprint
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
