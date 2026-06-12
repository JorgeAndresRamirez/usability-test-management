import { NextResponse } from "next/server";

import { buildParticipantPresentation } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const test = await prisma.usabilityTest.findUnique({
    where: { presentationToken: token },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Presentación no encontrada" }, { status: 404 });
  }

  let session = null;

  if (sessionId) {
    session = await prisma.testSession.findFirst({
      where: { id: sessionId, testId: test.id },
    });
  } else {
    session = await prisma.testSession.findFirst({
      where: {
        testId: test.id,
        status: "IN_PROGRESS",
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  const presentation = buildParticipantPresentation(test, session);

  return NextResponse.json({
    sessionId: session?.id ?? null,
    ...presentation,
  });
}
