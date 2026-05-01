"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";

export function LoginCard({ oauthReady }: { oauthReady: boolean }) {
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const nextPath = searchParams.get("next") || "/";
  const error = searchParams.get("error");
  const discordAuthHref = `/api/auth/discord?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="card stack">
      <div>
        <div className="tag">Discord Login</div>
        <h2 className="section-title">Connect your Discord account</h2>
        <p className="section-subtitle">
          Sign in with Discord to save your profile, submit forms, and keep
          track of your KOVA applications in one place.
        </p>
      </div>

      {error ? <div className="notice notice--error">{getLoginError(error)}</div> : null}

      <div className="notice">
        You can browse the forms first and only sign in when you are ready to
        submit or manage your saved applications.
      </div>

      <div className="notice">
        {oauthReady
          ? "You will be redirected to Discord, approve the login, and then return here with your KOVA session active."
          : "Discord OAuth still needs live app credentials in the environment before sign-in can work."}
      </div>

      <div className="row">
        {session ? (
          <Link className="button button--primary" href={nextPath}>
            Continue
          </Link>
        ) : oauthReady ? (
          <a className="button button--primary" href={discordAuthHref}>
            Continue with Discord
          </a>
        ) : (
          <span className="button button--secondary" aria-disabled="true">
            Discord Login Unavailable
          </span>
        )}
        <Link className="button button--secondary" href="/">
          Back Home
        </Link>
      </div>
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
