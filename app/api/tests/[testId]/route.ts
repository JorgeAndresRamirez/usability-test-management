import { NextResponse } from "next/server";

import { mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import {
  getTestEditabilityCounts,
  isTestConfigurationEditable,
  TEST_CONFIG_LOCKED_MESSAGE,
} from "@/lib/test-editability.server";
import { updateTestSchema } from "@/lib/validators/test";

const CONFIG_FIELDS = [
  "projectName",
  "startDate",
  "endDate",
  "prototypeUrl",
  "userProfileCriteria",
  "welcomeEnabled",
  "welcomeTitle",
  "welcomeInstructions",
] as const;

function updatesConfiguration(body: Record<string, unknown>): boolean {
  return CONFIG_FIELDS.some((field) => body[field] !== undefined);
}

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      participants: { orderBy: { orderIndex: "asc" } },
      sessions: {
        include: {
          participant: true,
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    ...test,
    tasks: test.tasks.map(mapTaskToModerator),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { testId } = await context.params;
  const body = await request.json();
  const parsed = updateTestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Test no encontrado" }, { status: 404 });
  }

  if (updatesConfiguration(parsed.data)) {
    const counts = await getTestEditabilityCounts(testId);
    if (!isTestConfigurationEditable(counts)) {
      return NextResponse.json({ error: TEST_CONFIG_LOCKED_MESSAGE }, { status: 409 });
    }
  }

  const { startDate, endDate, prototypeUrl, welcomeEnabled, welcomeTitle, welcomeInstructions, ...rest } =
    parsed.data;

  const test = await prisma.usabilityTest.update({
    where: { id: testId },
    data: {
      ...rest,
      ...(prototypeUrl !== undefined && { prototypeUrl: prototypeUrl || null }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(welcomeEnabled !== undefined && { welcomeEnabled }),
      ...(welcomeTitle !== undefined && { welcomeTitle }),
      ...(welcomeInstructions !== undefined && { welcomeInstructions }),
    },
  });

  return NextResponse.json(test);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const existing = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  await prisma.usabilityTest.delete({ where: { id: testId } });

  return NextResponse.json({ success: true });
}
