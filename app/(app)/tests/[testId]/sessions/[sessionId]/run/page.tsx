import { notFound } from "next/navigation";

import { ExecutionRunClient } from "@/components/moderator/ExecutionRunClient";
import { mapSessionToModerator, mapTaskToModerator } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ testId: string; sessionId: string }>;
};

export default async function RunPage({ params }: PageProps) {
  const { testId, sessionId } = await params;

  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, testId },
    include: {
      participant: true,
      test: {
        include: {
          tasks: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  return (
    <ExecutionRunClient
      testId={testId}
      projectName={session.test.projectName}
      initialSession={mapSessionToModerator(session)}
      initialTasks={session.test.tasks.map(mapTaskToModerator)}
      welcomeEnabled={session.test.welcomeEnabled}
      welcomeTitle={session.test.welcomeTitle}
      welcomeInstructions={session.test.welcomeInstructions}
    />
  );
}
