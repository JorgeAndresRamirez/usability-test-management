import { NextResponse } from "next/server";

import { deleteEvidenceFile, saveEvidenceScreenshot } from "@/lib/evidence-storage";
import { prisma } from "@/lib/prisma";
import { synthesisWriteForbiddenResponse } from "@/lib/synthesis.server";
import { mapFindingRecord } from "@/lib/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string; executionId: string; findingId: string }>;
};

async function getFindingContext(
  sessionId: string,
  executionId: string,
  findingId: string,
) {
  return prisma.executionFinding.findFirst({
    where: {
      id: findingId,
      executionId,
      execution: { sessionId },
    },
    include: {
      execution: {
        include: { session: { select: { testId: true } } },
      },
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId, executionId, findingId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const finding = await getFindingContext(sessionId, executionId, findingId);
  if (!finding) {
    return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  try {
    if (finding.screenshotPath) {
      await deleteEvidenceFile(finding.screenshotPath);
    }

    const saved = await saveEvidenceScreenshot({
      testId: finding.execution.session.testId,
      sessionId,
      findingId,
      file,
    });

    const updated = await prisma.executionFinding.update({
      where: { id: findingId },
      data: {
        screenshotPath: saved.relativePath,
        screenshotOriginalName: saved.originalName,
      },
    });

    return NextResponse.json({ finding: mapFindingRecord(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPLOAD_FAILED";
    if (message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "La imagen supera el límite de 5 MB" }, { status: 400 });
    }
    if (message === "INVALID_FILE_TYPE") {
      return NextResponse.json(
        { error: "Formato no permitido. Usa PNG, JPEG o WebP" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "No se pudo subir la captura" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId, executionId, findingId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const finding = await getFindingContext(sessionId, executionId, findingId);
  if (!finding) {
    return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  }

  await deleteEvidenceFile(finding.screenshotPath);

  const updated = await prisma.executionFinding.update({
    where: { id: findingId },
    data: {
      screenshotPath: null,
      screenshotOriginalName: null,
    },
  });

  return NextResponse.json({ finding: mapFindingRecord(updated) });
}
