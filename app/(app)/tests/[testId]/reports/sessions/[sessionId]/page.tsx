import { notFound } from "next/navigation";

import { SessionDetailClient } from "@/components/reports/SessionDetailClient";
import { buildExecutiveReport } from "@/lib/executive-report";
import { prisma } from "@/lib/prisma";
import { getSessionForSynthesis } from "@/lib/synthesis.server";
import { mapSessionToSynthesis } from "@/lib/synthesis";

type PageProps = {
  params: Promise<{ testId: string; sessionId: string }>;
};

export default async function SessionReportPage({ params }: PageProps) {
  const { testId, sessionId } = await params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      sessions: {
        include: {
          participant: true,
          recordingMarkers: true,
        },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!test) notFound();

  const sessionExists = test.sessions.some((s) => s.id === sessionId);
  if (!sessionExists) notFound();

  const executions = await prisma.taskExecution.findMany({
    where: { session: { testId }, result: { not: null } },
    include: {
      task: true,
      session: { include: { participant: true } },
      findings: { orderBy: { orderIndex: "asc" } },
    },
  });

  const report = buildExecutiveReport(
    test,
    executions,
    test._count.participants,
    test.sessions.filter((s) => s.status === "COMPLETED").length,
    test.sessions,
  );

  const session = report.sessionObservations.find((s) => s.sessionId === sessionId);
  if (!session) notFound();

  const synthesisSession = await getSessionForSynthesis(sessionId);
  const synthesis = synthesisSession ? mapSessionToSynthesis(synthesisSession) : null;

  return (
    <SessionDetailClient
      testId={testId}
      projectName={test.projectName}
      session={session}
      synthesis={synthesis}
      allSessions={report.sessionObservations}
    />
  );
}
