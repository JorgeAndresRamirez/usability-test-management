import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getSessionForSynthesis,
  synthesisWriteForbiddenResponse,
} from "@/lib/synthesis.server";
import { mapSessionToSynthesis } from "@/lib/synthesis";
import { updateSessionSynthesisSchema } from "@/lib/validators/synthesis";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getSessionForSynthesis(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ synthesis: mapSessionToSynthesis(session) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });

  const forbidden = synthesisWriteForbiddenResponse(session);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = updateSessionSynthesisSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const updated = await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      ...(parsed.data.recordingUrl !== undefined && {
        recordingUrl: parsed.data.recordingUrl,
      }),
      ...(parsed.data.recordingNotes !== undefined && {
        recordingNotes: parsed.data.recordingNotes,
      }),
    },
  });

  return NextResponse.json({
    recordingUrl: updated.recordingUrl,
    recordingNotes: updated.recordingNotes,
  });
}
