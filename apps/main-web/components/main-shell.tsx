"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/members", label: "Members" },
  { href: "/events", label: "Events" },
  { href: "/apply", label: "Apply" },
];

const footerLinks = [
  { href: "/legal", label: "Legal" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/imprint", label: "Imprint" },
];

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    function clearHideTimer() {
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    }

    function scheduleHide(currentY: number) {
      clearHideTimer();

      if (currentY <= 8) {
        setHidden(false);
        return;
      }

      hideTimer.current = window.setTimeout(() => {
        setHidden(true);
      }, 700);
    }

    function handleScroll() {
      const currentY = window.scrollY;
      const goingUp = currentY < lastY.current;
      const movement = Math.abs(currentY - lastY.current);

      if (currentY <= 8) {
        setHidden(false);
        clearHideTimer();
      } else if (movement > 1) {
        if (goingUp) {
          setHidden(false);
        } else {
          setHidden(true);
        }

        scheduleHide(currentY);
      }

      lastY.current = currentY;
    }

    lastY.current = window.scrollY;
    scheduleHide(lastY.current);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearHideTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="site site--main">
      <header className={`navbar navbar--main${hidden ? " navbar--hidden" : ""}`}>
        <div className="navbar__glow navbar__glow--gold" aria-hidden="true" />
        <div className="navbar__inner navbar__inner--main">
          <Link className="nav-logo nav-logo--main" href="/">
            KOVA ESPORTS
          </Link>

          <nav className="nav-links nav-links--main" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  className={`nav-link nav-link--main${active ? " nav-link--active" : ""}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="shell shell--main">
        <div className="shell__inner shell__inner--main">{children}</div>
      </main>

      <footer className="footer footer--main">
        <div className="footer__inner footer__inner--main">
          <div>
            <div className="footer__label footer__label--main">KOVA Esports</div>
            <div className="footer__copy">{"\u00A9"} {year} KOVA Esports. Public organization website.</div>
          </div>

          <nav className="footer__links footer__links--main">
            {footerLinks.map((item) => (
              <Link className="footer__link" key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
