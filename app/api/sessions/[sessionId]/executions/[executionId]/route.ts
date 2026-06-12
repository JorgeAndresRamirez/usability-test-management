import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updateExecutionNotesSchema } from "@/lib/validators/execution";

type RouteContext = {
  params: Promise<{ sessionId: string; executionId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, executionId } = await context.params;
  const body = await request.json();
  const parsed = updateExecutionNotesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const execution = await prisma.taskExecution.findFirst({
    where: { id: executionId, sessionId },
  });

  if (!execution) {
    return NextResponse.json({ error: "Ejecución no encontrada" }, { status: 404 });
  }

  const updated = await prisma.taskExecution.update({
    where: { id: executionId },
    data: { thinkAloudNotes: parsed.data.thinkAloudNotes },
  });

  return NextResponse.json(updated);
}
