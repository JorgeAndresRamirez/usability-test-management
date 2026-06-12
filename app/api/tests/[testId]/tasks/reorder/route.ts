import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const reorderSchema = z.object({
  taskId: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { testId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const tasks = await prisma.task.findMany({
    where: { testId },
    orderBy: { orderIndex: "asc" },
  });

  const currentIndex = tasks.findIndex((task) => task.id === parsed.data.taskId);
  if (currentIndex === -1) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const targetIndex =
    parsed.data.direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= tasks.length) {
    return NextResponse.json({ success: true });
  }

  const currentTask = tasks[currentIndex];
  const swapTask = tasks[targetIndex];
  const tempIndex = Math.max(...tasks.map((task) => task.orderIndex), -1) + 1000;

  try {
    await prisma.$transaction([
      prisma.task.update({
        where: { id: currentTask.id },
        data: { orderIndex: tempIndex },
      }),
      prisma.task.update({
        where: { id: swapTask.id },
        data: { orderIndex: currentTask.orderIndex },
      }),
      prisma.task.update({
        where: { id: currentTask.id },
        data: { orderIndex: swapTask.orderIndex },
      }),
    ]);
  } catch {
    return NextResponse.json(
      { error: "No se pudo reordenar la situación" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
