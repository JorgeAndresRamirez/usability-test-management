import { NextResponse } from "next/server";

import { mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { taskFormSchema } from "@/lib/validators/task";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const tasks = await prisma.task.findMany({
    where: { testId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(tasks.map(mapTaskToModerator));
}

export async function POST(request: Request, context: RouteContext) {
  const { testId } = await context.params;
  const body = await request.json();
  const parsed = taskFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lastTask = await prisma.task.findFirst({
    where: { testId },
    orderBy: { orderIndex: "desc" },
  });

  const task = await prisma.task.create({
    data: {
      testId,
      orderIndex: (lastTask?.orderIndex ?? -1) + 1,
      ...parsed.data,
    },
  });

  return NextResponse.json(mapTaskToModerator(task), { status: 201 });
}
