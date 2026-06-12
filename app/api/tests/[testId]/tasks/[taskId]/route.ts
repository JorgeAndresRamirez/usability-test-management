import { NextResponse } from "next/server";

import { mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { taskFormSchema } from "@/lib/validators/task";

type RouteContext = {
  params: Promise<{ testId: string; taskId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { testId, taskId } = await context.params;
  const body = await request.json();
  const parsed = taskFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, testId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
  });

  return NextResponse.json(mapTaskToModerator(task));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { testId, taskId } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id: taskId, testId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: taskId } });

    const remaining = await tx.task.findMany({
      where: { testId },
      orderBy: { orderIndex: "asc" },
    });

    await Promise.all(
      remaining.map((task, index) =>
        tx.task.update({
          where: { id: task.id },
          data: { orderIndex: index },
        }),
      ),
    );
  });

  return NextResponse.json({ success: true });
}
