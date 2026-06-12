import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createParticipantSchema } from "@/lib/validators/participant";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  const participants = await prisma.participant.findMany({
    where: { testId },
    orderBy: { orderIndex: "asc" },
    include: {
      sessions: true,
    },
  });

  return NextResponse.json(participants);
}

export async function POST(request: Request, context: RouteContext) {
  const { testId } = await context.params;
  const body = await request.json();
  const parsed = createParticipantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const last = await prisma.participant.findFirst({
    where: { testId },
    orderBy: { orderIndex: "desc" },
  });

  const participant = await prisma.participant.create({
    data: {
      testId,
      code: parsed.data.code.toUpperCase(),
      notes: parsed.data.notes ?? null,
      orderIndex: (last?.orderIndex ?? -1) + 1,
    },
  });

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    select: { welcomeEnabled: true },
  });

  const session = await prisma.testSession.create({
    data: {
      testId,
      participantId: participant.id,
      currentTaskIndex: test?.welcomeEnabled ? -1 : 0,
    },
  });

  return NextResponse.json({ participant, session }, { status: 201 });
}
