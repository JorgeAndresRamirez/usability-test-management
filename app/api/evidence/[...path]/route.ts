import { NextResponse } from "next/server";

import {
  getMimeTypeFromPath,
  readEvidenceFile,
  resolveEvidenceAbsolutePath,
} from "@/lib/evidence-storage";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const relativePath = pathSegments.join("/");

  if (!relativePath) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  const finding = await prisma.executionFinding.findFirst({
    where: { screenshotPath: relativePath },
  });

  if (!finding) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  try {
    resolveEvidenceAbsolutePath(relativePath);
    const buffer = await readEvidenceFile(relativePath);
    const mimeType = getMimeTypeFromPath(relativePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  }
}
