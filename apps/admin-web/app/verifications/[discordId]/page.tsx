import { AdminShell } from "../../../components/admin-shell";
import { SessionGate } from "../../../components/session-gate";
import { VerificationReview } from "../../../components/verification-review";

export default async function VerificationReviewPage({
  params,
}: {
  params: Promise<{ discordId: string }>;
}) {
  const { discordId } = await params;

  return (
    <AdminShell>
      <SessionGate
        title="Login required"
        copy="Connect your Discord account to review verification records."
      >
        {(session) => <VerificationReview session={session} discordId={discordId} />}
      </SessionGate>
    </AdminShell>
  );
}
