import { NextResponse } from "next/server";

import { mapSessionToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { updateSessionSchema } from "@/lib/validators/execution";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      participant: true,
      test: {
        include: {
          tasks: { orderBy: { orderIndex: "asc" } },
        },
      },
      executions: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    session: mapSessionToModerator(session),
    tasks: session.test.tasks,
    executions: session.executions,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const body = await request.json();
  const parsed = updateSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      test: {
        include: { tasks: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const data: {
    currentTaskIndex?: number;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    startedAt?: Date;
    completedAt?: Date | null;
  } = {};

  if (parsed.data.startTask) {
    data.status = "IN_PROGRESS";
    data.startedAt = session.startedAt ?? new Date();
  }

  if (parsed.data.startFirstSituation) {
    if (session.currentTaskIndex !== -1) {
      return NextResponse.json(
        { error: "La bienvenida ya fue completada o no está activa" },
        { status: 400 },
      );
    }
    data.currentTaskIndex = 0;
  }

  if (parsed.data.advanceTask) {
    const nextIndex = session.currentTaskIndex + 1;
    const isLast = nextIndex >= session.test.tasks.length;

    data.currentTaskIndex = isLast ? session.currentTaskIndex : nextIndex;
    if (isLast) {
      data.status = "COMPLETED";
      data.completedAt = new Date();
    }
  }

  if (parsed.data.currentTaskIndex !== undefined) {
    data.currentTaskIndex = parsed.data.currentTaskIndex;
  }

  if (parsed.data.status) {
    data.status = parsed.data.status;
    if (parsed.data.status === "COMPLETED") {
      data.completedAt = new Date();
    }
  }

  const updated = await prisma.testSession.update({
    where: { id: sessionId },
    data,
    include: {
      participant: true,
      test: true,
    },
  });

  if (parsed.data.startTask) {
    const isWelcomePhase = session.currentTaskIndex === -1;

    if (!isWelcomePhase) {
      const currentTask = session.test.tasks.find(
        (task) => task.orderIndex === session.currentTaskIndex,
      );

      if (currentTask) {
        await prisma.taskExecution.upsert({
          where: {
            sessionId_taskId: {
              sessionId,
              taskId: currentTask.id,
            },
          },
          create: {
            sessionId,
            taskId: currentTask.id,
            startedAt: new Date(),
          },
          update: {
            startedAt: new Date(),
          },
        });
      }
    }
  }

  if (parsed.data.startFirstSituation) {
    const firstTask = session.test.tasks.find((task) => task.orderIndex === 0);

    if (firstTask) {
      await prisma.taskExecution.upsert({
        where: {
          sessionId_taskId: {
            sessionId,
            taskId: firstTask.id,
          },
        },
        create: {
          sessionId,
          taskId: firstTask.id,
          startedAt: new Date(),
        },
        update: {
          startedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json(mapSessionToModerator(updated));
}
