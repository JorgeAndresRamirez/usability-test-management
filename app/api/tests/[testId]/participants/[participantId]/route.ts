import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ testId: string; participantId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { testId, participantId } = await context.params;

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, testId },
  });

  if (!participant) {
    return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
  }

  await prisma.participant.delete({ where: { id: participantId } });

  const remaining = await prisma.participant.findMany({
    where: { testId },
    orderBy: { orderIndex: "asc" },
  });

  await Promise.all(
    remaining.map((item, index) =>
      prisma.participant.update({
        where: { id: item.id },
        data: { orderIndex: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
