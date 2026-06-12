"use client";

import { useEffect, useState } from "react";

import { ScenarioCard } from "@/components/participant/ScenarioCard";
import { WelcomeScreen } from "@/components/participant/WelcomeScreen";
import type { ParticipantPresentation } from "@/lib/types/participant";

type PresentationClientProps = {
  token: string;
  sessionId?: string;
};

function ParticipantCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="participant-canvas flex min-h-screen items-center justify-center px-8 py-16">
      {children}
    </div>
  );
}

export function PresentationClient({ token, sessionId }: PresentationClientProps) {
  const [presentation, setPresentation] = useState<ParticipantPresentation | null>(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      const query = sessionId ? `?sessionId=${sessionId}` : "";
      const response = await fetch(`/api/presentation/${token}${query}`);
      if (!response.ok) return;
      const data = await response.json();
      setPresentation({
        welcome: data.welcome ?? null,
        currentSituation: data.currentSituation,
        totalSituations: data.totalSituations,
        sessionStatus: data.sessionStatus,
      });
    };

    fetchPresentation();
    const interval = setInterval(fetchPresentation, 2000);
    return () => clearInterval(interval);
  }, [token, sessionId]);

  if (!presentation) {
    return (
      <div className="participant-canvas flex min-h-screen items-center justify-center">
        <div className="size-2 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  if (presentation.sessionStatus === "COMPLETED") {
    return (
      <ParticipantCanvas>
        <div className="animate-fade-up text-center">
          <p className="font-display text-balance text-3xl font-medium tracking-tight text-foreground">
            Gracias por tu participación
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Has completado todas las situaciones.
          </p>
        </div>
      </ParticipantCanvas>
    );
  }

  if (presentation.welcome) {
    return (
      <ParticipantCanvas>
        <WelcomeScreen
          title={presentation.welcome.title}
          instructions={presentation.welcome.instructions}
        />
      </ParticipantCanvas>
    );
  }

  if (!presentation.currentSituation) {
    return (
      <ParticipantCanvas>
        <p className="animate-fade-up text-center text-sm text-muted-foreground">
          Esperando al moderador para iniciar…
        </p>
      </ParticipantCanvas>
    );
  }

  const situationNumber = Number(
    presentation.currentSituation.situationLabel.replace("Situación ", ""),
  );

  return (
    <ParticipantCanvas>
      <ScenarioCard
        situationNumber={situationNumber}
        narrative={presentation.currentSituation.narrative}
      />
    </ParticipantCanvas>
  );
}
