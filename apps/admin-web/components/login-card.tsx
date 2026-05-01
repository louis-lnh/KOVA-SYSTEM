"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";

export function LoginCard({ oauthReady }: { oauthReady: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const nextPath = searchParams.get("next") || "/";
  const error = searchParams.get("error");
  const discordAuthHref = `/api/auth/discord?next=${encodeURIComponent(nextPath)}`;

  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [nextPath, router, session]);

  return (
    <div className="login-hero">
      <div>
        <div className="tag">KOVA ESPORTS</div>
        <h1 className="landing-hero__title">KOVA ADMIN PANEL</h1>
        <p className="landing-hero__copy">
          Sign in with Discord to access the internal KOVA admin panel.
        </p>
      </div>

      {error ? <div className="notice notice--error">{getLoginError(error)}</div> : null}

      <div className="landing-hero__actions">
        {oauthReady ? (
          <a className="button button--primary" href={discordAuthHref}>
            Continue with Discord
          </a>
        ) : (
          <span className="button button--secondary" aria-disabled="true">
            Discord Login Unavailable
          </span>
        )}
      </div>

      {!oauthReady ? (
        <div className="notice">
          Discord OAuth still needs live app credentials in the environment
          before sign-in can work.
        </div>
      ) : null}
    </div>
  );
}

function getLoginError(error: string) {
  switch (error) {
    case "cancelled":
      return "Discord login was cancelled before it finished.";
    case "invalid_state":
      return "The login session expired or became invalid. Please try again.";
    case "session_failed":
      return "We could not finish the Discord login. Please try again.";
    case "unavailable":
      return "Discord login is unavailable right now. Please try again shortly.";
    default:
      return "We could not finish the Discord login. Please try again.";
  }
}
