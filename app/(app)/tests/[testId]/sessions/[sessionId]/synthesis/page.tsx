import { notFound, redirect } from "next/navigation";

import { SessionSynthesisClient } from "@/components/synthesis/SessionSynthesisClient";
import { getSessionForSynthesis } from "@/lib/synthesis.server";
import { mapSessionToSynthesis } from "@/lib/synthesis";

type PageProps = {
  params: Promise<{ testId: string; sessionId: string }>;
};

export default async function SessionSynthesisPage({ params }: PageProps) {
  const { testId, sessionId } = await params;

  const session = await getSessionForSynthesis(sessionId);

  if (!session || session.testId !== testId) {
    notFound();
  }

  if (session.status !== "COMPLETED") {
    redirect(`/tests/${testId}/sessions/${sessionId}/run`);
  }

  return <SessionSynthesisClient initialSynthesis={mapSessionToSynthesis(session)} />;
}
