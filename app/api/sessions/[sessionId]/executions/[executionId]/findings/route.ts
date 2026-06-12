import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  assertExecutionInSession,
  getNextFindingOrderIndex,
  synthesisWriteForbiddenResponse,
} from "@/lib/synthesis.server";
import { mapFindingRecord } from "@/lib/synthesis";
import { createExecutionFindingSchema } from "@/lib/validators/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string; executionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId, executionId } = await context.params;

  const execution = await assertExecutionInSession(prisma, sessionId, executionId);
  if (!execution) {
    return NextResponse.json({ error: "Situación no encontrada" }, { status: 404 });
  }

  const findings = await prisma.executionFinding.findMany({
    where: { executionId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ findings: findings.map(mapFindingRecord) });
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId, executionId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const execution = await assertExecutionInSession(prisma, sessionId, executionId);
  if (!execution) {
    return NextResponse.json({ error: "Situación no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createExecutionFindingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const finding = await prisma.executionFinding.create({
    data: {
      executionId,
      orderIndex: await getNextFindingOrderIndex(executionId),
      title: parsed.data.title,
      observation: parsed.data.observation,
      recommendation: parsed.data.recommendation,
      recordingOffsetSeconds: parsed.data.recordingOffsetSeconds ?? null,
    },
  });

  return NextResponse.json({ finding: mapFindingRecord(finding) }, { status: 201 });
}
