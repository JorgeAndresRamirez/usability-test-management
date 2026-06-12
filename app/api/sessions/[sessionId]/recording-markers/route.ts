import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  assertExecutionInSession,
  getNextMarkerOrderIndex,
  synthesisWriteForbiddenResponse,
} from "@/lib/synthesis.server";
import { mapMarkerRecord } from "@/lib/synthesis";
import { createRecordingMarkerSchema } from "@/lib/validators/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  const markers = await prisma.sessionRecordingMarker.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
    include: {
      execution: { include: { task: { select: { orderIndex: true } } } },
    },
  });

  return NextResponse.json({ markers: markers.map(mapMarkerRecord) });
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = createRecordingMarkerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  if (parsed.data.executionId) {
    const execution = await assertExecutionInSession(
      prisma,
      sessionId,
      parsed.data.executionId,
    );
    if (!execution) {
      return NextResponse.json({ error: "Situación no encontrada en esta sesión" }, { status: 404 });
    }
  }

  const marker = await prisma.sessionRecordingMarker.create({
    data: {
      sessionId,
      orderIndex: await getNextMarkerOrderIndex(sessionId),
      offsetSeconds: parsed.data.offsetSeconds,
      label: parsed.data.label,
      notes: parsed.data.notes ?? null,
      executionId: parsed.data.executionId ?? null,
    },
    include: {
      execution: { include: { task: { select: { orderIndex: true } } } },
    },
  });

  return NextResponse.json({ marker: mapMarkerRecord(marker) }, { status: 201 });
}
