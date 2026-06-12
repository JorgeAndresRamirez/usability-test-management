import { NextResponse } from "next/server";

import { executionsToCsv } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    select: { projectName: true },
  });

  if (!test) {
    return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
  }

  const executions = await prisma.taskExecution.findMany({
    where: { session: { testId } },
    include: {
      task: true,
      session: { include: { participant: true } },
    },
  });

  const sorted = [...executions].sort((a, b) => {
    const p = a.session.participant.code.localeCompare(b.session.participant.code);
    if (p !== 0) return p;
    return a.task.orderIndex - b.task.orderIndex;
  });

  const csv = executionsToCsv(sorted);
  const filename = `reporte-${test.projectName.replace(/\s+/g, "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
