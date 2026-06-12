import { notFound } from "next/navigation";

import { TaskSetupClient } from "@/components/moderator/TaskSetupClient";
import { mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ testId: string }>;
};

export default async function SetupPage({ params }: PageProps) {
  const { testId } = await params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      sessions: { take: 1 },
    },
  });

  if (!test) {
    notFound();
  }

  return (
    <TaskSetupClient
      testId={test.id}
      projectName={test.projectName}
      presentationToken={test.presentationToken}
      initialTasks={test.tasks.map(mapTaskToModerator)}
      sessionId={test.sessions[0]?.id ?? null}
    />
  );
}
