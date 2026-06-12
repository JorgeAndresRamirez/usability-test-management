import { NextResponse } from "next/server";

import { deleteEvidenceFile } from "@/lib/evidence-storage";
import { prisma } from "@/lib/prisma";
import { synthesisWriteForbiddenResponse } from "@/lib/synthesis.server";
import { mapFindingRecord } from "@/lib/synthesis";
import { updateExecutionFindingSchema } from "@/lib/validators/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string; executionId: string; findingId: string }>;
};

async function getFindingInSession(
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
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, executionId, findingId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const existing = await getFindingInSession(sessionId, executionId, findingId);
  if (!existing) {
    return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateExecutionFindingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const finding = await prisma.executionFinding.update({
    where: { id: findingId },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.observation !== undefined && { observation: parsed.data.observation }),
      ...(parsed.data.recommendation !== undefined && {
        recommendation: parsed.data.recommendation,
      }),
      ...(parsed.data.recordingOffsetSeconds !== undefined && {
        recordingOffsetSeconds: parsed.data.recordingOffsetSeconds,
      }),
    },
  });

  return NextResponse.json({ finding: mapFindingRecord(finding) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId, executionId, findingId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const existing = await getFindingInSession(sessionId, executionId, findingId);
  if (!existing) {
    return NextResponse.json({ error: "Hallazgo no encontrado" }, { status: 404 });
  }

  await deleteEvidenceFile(existing.screenshotPath);
  await prisma.executionFinding.delete({ where: { id: findingId } });

  return NextResponse.json({ ok: true });
}
