import { Suspense } from "react";
import { AppShell } from "../../components/app-shell";
import { LoginCard } from "../../components/login-card";
import { isDiscordOAuthConfigured } from "../../lib/auth-session";

export default function LoginPage() {
  const oauthReady = isDiscordOAuthConfigured();

  return (
    <AppShell>
      <Suspense fallback={<div className="notice">Loading login...</div>}>
        <LoginCard oauthReady={oauthReady} />
      </Suspense>
    </AppShell>
  );
}
