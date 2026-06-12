import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  assertExecutionInSession,
  synthesisWriteForbiddenResponse,
} from "@/lib/synthesis.server";
import { mapMarkerRecord } from "@/lib/synthesis";
import { updateRecordingMarkerSchema } from "@/lib/validators/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string; markerId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, markerId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const existing = await prisma.sessionRecordingMarker.findFirst({
    where: { id: markerId, sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Marcador no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateRecordingMarkerSchema.safeParse(body);

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

  const marker = await prisma.sessionRecordingMarker.update({
    where: { id: markerId },
    data: {
      ...(parsed.data.offsetSeconds !== undefined && {
        offsetSeconds: parsed.data.offsetSeconds,
      }),
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      ...(parsed.data.executionId !== undefined && {
        executionId: parsed.data.executionId,
      }),
    },
    include: {
      execution: { include: { task: { select: { orderIndex: true } } } },
    },
  });

  return NextResponse.json({ marker: mapMarkerRecord(marker) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId, markerId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const existing = await prisma.sessionRecordingMarker.findFirst({
    where: { id: markerId, sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Marcador no encontrado" }, { status: 404 });
  }

  await prisma.sessionRecordingMarker.delete({ where: { id: markerId } });

  return NextResponse.json({ ok: true });
}
