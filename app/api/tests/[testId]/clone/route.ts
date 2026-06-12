import { NextResponse } from "next/server";

import { mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const source = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const clone = await prisma.usabilityTest.create({
    data: {
      projectName: `${source.projectName} (copia)`,
      startDate: source.startDate,
      endDate: source.endDate,
      prototypeUrl: source.prototypeUrl,
      userProfileCriteria: source.userProfileCriteria,
      status: "DRAFT",
      welcomeEnabled: source.welcomeEnabled,
      welcomeTitle: source.welcomeTitle,
      welcomeInstructions: source.welcomeInstructions,
      tasks: {
        create: source.tasks.map((task) => ({
          orderIndex: task.orderIndex,
          startPoint: task.startPoint,
          goalDescription: task.goalDescription,
          successCriterion: task.successCriterion,
          maxTimeMinutes: task.maxTimeMinutes,
          scenarioNarrative: task.scenarioNarrative,
          askSatisfaction: task.askSatisfaction,
        })),
      },
    },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(
    {
      ...clone,
      tasks: clone.tasks.map(mapTaskToModerator),
    },
    { status: 201 },
  );
}
