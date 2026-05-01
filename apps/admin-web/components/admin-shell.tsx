"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./auth-provider";
import { hasRequiredAccess } from "../lib/admin-actions";

export function AdminShell({ children }: { children: React.ReactNode }) {
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loginHref = `/api/auth/discord?next=${encodeURIComponent(pathname || "/")}`;
  const hasAdminNavigation = session && session.accessLevel !== "none";
  const accessLevels = [
    {
      id: "none",
      label: "None",
      description: "No internal staff tools or protected review workflows.",
    },
    {
      id: "mod",
      label: "Mod",
      description: "Application review, verification handling, and moderation workflows.",
    },
    {
      id: "admin",
      label: "Admin",
      description: "Everything mod has, plus broader operational control.",
    },
    {
      id: "full",
      label: "Full",
      description: "Highest internal access, including access management and protected tools.",
    },
  ] as const;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setAccessOpen(false);
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
            KOVA ADMIN
          </Link>

          {hasAdminNavigation ? (
            <nav className="nav-links">
              <Link className="nav-link" href="/actions">
                Actions
              </Link>
            </nav>
          ) : (
            <div className="nav-links nav-links--empty" aria-hidden="true" />
          )}

          <div className="nav-right">
            {loading ? (
              <div className="auth-chip">
                <span className="auth-name">Loading</span>
                <span className="avatar avatar--placeholder">..</span>
              </div>
            ) : session ? (
              <div className="account-menu account-menu--split" ref={menuRef}>
                <div className="account-menu__group">
                  <button
                    type="button"
                    className="account-menu__trigger account-menu__trigger--pill"
                    onClick={() => {
                      setAccessOpen((current) => !current);
                      setProfileOpen(false);
                    }}
                  >
                    <span className="access-pill">{session.accessLevel}</span>
                  </button>

                  {accessOpen ? (
                    <div className="account-menu__dropdown account-menu__dropdown--access">
                      <div className="account-menu__section-title">Access Levels</div>
                      <div className="access-menu">
                        {accessLevels.map((level) => (
                          <div
                            key={level.id}
                            className={`access-menu__item ${
                              session.accessLevel === level.id
                                ? "access-menu__item--active"
                                : ""
                            }`}
                          >
                            <div className="access-menu__top">
                              <span
                                className={`access-badge access-badge--${level.id === "none" ? "mod" : level.id}`}
                              >
                                {level.label}
                              </span>
                              {session.accessLevel === level.id ? (
                                <span className="access-menu__current">Current</span>
                              ) : null}
                            </div>
                            <div className="access-menu__description">
                              {level.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="account-menu__group">
                  <button
                    type="button"
                    className="account-menu__trigger"
                    onClick={() => {
                      setProfileOpen((current) => !current);
                      setAccessOpen(false);
                    }}
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

                  {profileOpen ? (
                    <div className="account-menu__dropdown">
                      {session.accessLevel !== "none" ? (
                        <>
                          <Link
                            className="account-menu__item"
                            href="/"
                            onClick={() => setProfileOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            className="account-menu__item"
                            href="/actions"
                            onClick={() => setProfileOpen(false)}
                          >
                            Admin Actions
                          </Link>
                          {hasRequiredAccess(session.accessLevel, "full") ? (
                            <Link
                              className="account-menu__item"
                              href="/access"
                              onClick={() => setProfileOpen(false)}
                            >
                              Access Management
                            </Link>
                          ) : null}
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="account-menu__item account-menu__item--button"
                        onClick={() => {
                          setProfileOpen(false);
                          void logout();
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
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
            <div className="footer__label">KOVA Admin</div>
            <div className="footer__copy">
              © {year} KOVA Esports. Internal staff panel.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
