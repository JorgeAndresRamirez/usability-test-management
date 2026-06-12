import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { ReportPdfDocument } from "@/components/reports/ReportPdfDocument";
import { buildExecutiveReport } from "@/lib/executive-report";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      sessions: { include: { participant: true } },
      _count: { select: { participants: true } },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
  }

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

  const buffer = await renderToBuffer(<ReportPdfDocument report={report} />);
  const filename = `informe-ejecutivo-${test.projectName.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
