import { AdminShell } from "../../../components/admin-shell";
import { ApplicationReview } from "../../../components/application-review";
import { SessionGate } from "../../../components/session-gate";

export default async function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  return (
    <AdminShell>
      <SessionGate
        title="Login required"
        copy="Connect your Discord account to review application records."
      >
        {(session) => <ApplicationReview session={session} applicationId={applicationId} />}
      </SessionGate>
    </AdminShell>
  );
}
