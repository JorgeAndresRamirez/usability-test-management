import { notFound } from "next/navigation";

import { ReportsClient } from "@/components/reports/ReportsClient";
import { buildExecutiveReport } from "@/lib/executive-report";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ testId: string }>;
};

export default async function ReportsPage({ params }: PageProps) {
  const { testId } = await params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      sessions: { include: { participant: true } },
      _count: { select: { participants: true } },
    },
  });

  if (!test) notFound();

  const executions = await prisma.taskExecution.findMany({
    where: { session: { testId }, result: { not: null } },
    include: {
      task: true,
      session: { include: { participant: true } },
    },
  });

  const report = buildExecutiveReport(
    test,
    executions,
    test._count.participants,
    test.sessions.filter((s) => s.status === "COMPLETED").length,
    test.sessions,
  );

  return (
    <ReportsClient
      testId={testId}
      sessionId={test.sessions[0]?.id ?? null}
      report={report}
    />
  );
}
