import { NextResponse } from "next/server";

import { deriveTaskCompleted } from "@/lib/execution-rules";
import { prisma } from "@/lib/prisma";
import { createExecutionSchema } from "@/lib/validators/execution";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const body = await request.json();
  const parsed = createExecutionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.taskId, testId: session.testId },
  });

  if (!task) {
    return NextResponse.json({ error: "Situación no encontrada" }, { status: 404 });
  }

  const satisfaction = parsed.data.subjectiveSatisfaction ?? null;

  if (task.askSatisfaction) {
    if (satisfaction === null || satisfaction < 1 || satisfaction > 4) {
      return NextResponse.json(
        { error: "La satisfacción es obligatoria para esta situación" },
        { status: 400 },
      );
    }
  } else if (satisfaction !== null && satisfaction !== undefined) {
    return NextResponse.json(
      { error: "Esta situación no solicita satisfacción" },
      { status: 400 },
    );
  }

  const taskCompleted = deriveTaskCompleted(parsed.data.result);

  const execution = await prisma.taskExecution.upsert({
    where: {
      sessionId_taskId: {
        sessionId,
        taskId: parsed.data.taskId,
      },
    },
    create: {
      sessionId,
      taskId: parsed.data.taskId,
      result: parsed.data.result,
      taskCompleted,
      timeOnTaskSeconds: parsed.data.timeOnTaskSeconds,
      subjectiveSatisfaction: task.askSatisfaction ? satisfaction : null,
      nonCriticalErrorCount: parsed.data.nonCriticalErrorCount,
      nonCriticalSeverity: parsed.data.nonCriticalSeverity ?? null,
      isFalseCompletion: parsed.data.isFalseCompletion,
      helpRequested: parsed.data.helpRequested,
      thinkAloudNotes: parsed.data.thinkAloudNotes ?? "",
      startedAt: new Date(),
      completedAt: new Date(),
    },
    update: {
      result: parsed.data.result,
      taskCompleted,
      timeOnTaskSeconds: parsed.data.timeOnTaskSeconds,
      subjectiveSatisfaction: task.askSatisfaction ? satisfaction : null,
      nonCriticalErrorCount: parsed.data.nonCriticalErrorCount,
      nonCriticalSeverity: parsed.data.nonCriticalSeverity ?? null,
      isFalseCompletion: parsed.data.isFalseCompletion,
      helpRequested: parsed.data.helpRequested,
      thinkAloudNotes: parsed.data.thinkAloudNotes ?? "",
      completedAt: new Date(),
    },
  });

  return NextResponse.json(execution, { status: 201 });
}
