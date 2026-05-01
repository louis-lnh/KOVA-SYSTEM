import { Suspense } from "react";
import { AdminShell } from "../../components/admin-shell";
import { LoginCard } from "../../components/login-card";
import { isDiscordOAuthConfigured } from "../../lib/auth-session";

export default function LoginPage() {
  const oauthReady = isDiscordOAuthConfigured();

  return (
    <AdminShell>
      <Suspense fallback={<div className="notice">Loading login...</div>}>
        <LoginCard oauthReady={oauthReady} />
      </Suspense>
    </AdminShell>
  );
}
