import { NextResponse } from "next/server";

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getSessionForSynthesis(sessionId: string) {
  return prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      participant: true,
      test: {
        include: {
          tasks: { orderBy: { orderIndex: "asc" } },
        },
      },
      recordingMarkers: {
        orderBy: { orderIndex: "asc" },
        include: {
          execution: {
            include: { task: { select: { orderIndex: true } } },
          },
        },
      },
      executions: {
        include: {
          task: true,
          findings: { orderBy: { orderIndex: "asc" } },
        },
        orderBy: { task: { orderIndex: "asc" } },
      },
    },
  });
}

export function synthesisWriteForbiddenResponse(session: { status: string } | null) {
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }
  if (session.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "La síntesis solo está disponible cuando la sesión está completada" },
      { status: 409 },
    );
  }
  return null;
}

export async function assertExecutionInSession(
  client: PrismaClient,
  sessionId: string,
  executionId: string,
) {
  return client.taskExecution.findFirst({
    where: { id: executionId, sessionId },
    include: { findings: true },
  });
}

export async function getNextMarkerOrderIndex(sessionId: string): Promise<number> {
  const last = await prisma.sessionRecordingMarker.findFirst({
    where: { sessionId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  return (last?.orderIndex ?? -1) + 1;
}

export async function getNextFindingOrderIndex(executionId: string): Promise<number> {
  const last = await prisma.executionFinding.findFirst({
    where: { executionId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  return (last?.orderIndex ?? -1) + 1;
}
