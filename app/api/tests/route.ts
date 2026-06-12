import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createTestSchema } from "@/lib/validators/test";

export async function GET() {
  const tests = await prisma.usabilityTest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          participants: true,
          tasks: true,
        },
      },
    },
  });

  return NextResponse.json(tests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { startDate, endDate, prototypeUrl, ...rest } = parsed.data;

  const test = await prisma.usabilityTest.create({
    data: {
      ...rest,
      prototypeUrl: prototypeUrl || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(test, { status: 201 });
}
