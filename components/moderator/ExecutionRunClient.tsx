"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { ExecutionPanel } from "@/components/moderator/ExecutionPanel";
import { buttonVariants } from "@/components/ui/button";
import type { ModeratorSession, ModeratorTask } from "@/lib/types/moderator";

type ExecutionRunClientProps = {
  testId: string;
  projectName: string;
  initialSession: ModeratorSession;
  initialTasks: ModeratorTask[];
  welcomeEnabled: boolean;
  welcomeTitle: string;
  welcomeInstructions: string;
};

export function ExecutionRunClient({
  testId,
  projectName,
  initialSession,
  initialTasks,
  welcomeEnabled,
  welcomeTitle,
  welcomeInstructions,
}: ExecutionRunClientProps) {
  const [session, setSession] = useState(initialSession);
  const [tasks] = useState(initialTasks);

  const presentationUrl = `/p/${session.presentationToken}?sessionId=${session.id}`;

  const refreshSession = useCallback(async () => {
    const response = await fetch(`/api/sessions/${session.id}`);
    const data = await response.json();
    setSession(data.session);
  }, [session.id]);

  return (
    <>
      <TestNav testId={testId} sessionId={session.id} />
      <PageHeader
        eyebrow="Módulo 3"
        title={projectName}
        description={`Sesión en vivo con participante ${session.participantCode}. El cronómetro ToT es visible solo para ti.`}
        actions={
          <Link
            href={presentationUrl}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink className="size-4" />
            Abrir vista participante
          </Link>
        }
      />

      <ExecutionPanel
        sessionId={session.id}
        testId={testId}
        participantCode={session.participantCode}
        tasks={tasks}
        currentTaskIndex={session.currentTaskIndex}
        sessionStatus={session.status}
        welcomeEnabled={welcomeEnabled}
        welcomeTitle={welcomeTitle}
        welcomeInstructions={welcomeInstructions}
        onSessionUpdate={refreshSession}
      />
    </>
  );
}
