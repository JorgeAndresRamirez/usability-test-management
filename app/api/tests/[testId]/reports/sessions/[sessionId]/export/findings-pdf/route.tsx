import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { FindingsPdfDocument } from "@/components/reports/FindingsPdfDocument";
import { buildFindingsReport } from "@/lib/findings-report";
import { prisma } from "@/lib/prisma";
import { slugifyFilename } from "@/lib/test-transfer";

type RouteContext = {
  params: Promise<{ testId: string; sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId, sessionId } = await context.params;

  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, testId },
    include: { participant: true, test: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const report = await buildFindingsReport(sessionId);
  if (!report) {
    return NextResponse.json({ error: "No se pudo generar el informe" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<FindingsPdfDocument report={report} />);
  const filename = `${slugifyFilename(session.test.projectName)}-${session.participant.code}-hallazgos.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
