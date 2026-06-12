import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { buildTestTransferBundle, slugifyFilename } from "@/lib/test-transfer";

type RouteContext = {
  params: Promise<{ testId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { testId } = await context.params;

  try {
    const bundle = await buildTestTransferBundle(prisma, testId);
    const filename = `${slugifyFilename(bundle.test.projectName) || "proyecto"}-usabilidad.json`;
    const body = JSON.stringify(bundle, null, 2);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TEST_NOT_FOUND") {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    throw error;
  }
}
