import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { importTestTransferBundle, parseTestTransferBundle } from "@/lib/test-transfer";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  let raw: unknown;

  try {
    const text = await request.text();
    if (text.length > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo permitido (5 MB)" },
        { status: 413 },
      );
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "El archivo no es un JSON válido" }, { status: 400 });
  }

  try {
    const bundle = parseTestTransferBundle(raw);
    const test = await importTestTransferBundle(prisma, bundle);

    return NextResponse.json(
      {
        id: test.id,
        projectName: test.projectName,
        presentationToken: test.presentationToken,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Formato de exportación no válido", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un proyecto con los mismos datos de participantes o situaciones" },
        { status: 409 },
      );
    }

    throw error;
  }
}
