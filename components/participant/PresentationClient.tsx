"use client";

import { useEffect, useState } from "react";

import { ScenarioCard } from "@/components/participant/ScenarioCard";
import { WelcomeScreen } from "@/components/participant/WelcomeScreen";
import type { ParticipantPresentation } from "@/lib/types/participant";

type PresentationClientProps = {
  token: string;
  sessionId?: string;
};

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="size-1.5 animate-pulse rounded-full bg-slate-300" />
      </div>
    );
  }

  if (presentation.sessionStatus === "COMPLETED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8">
        <div className="text-center">
          <p className="text-2xl font-light tracking-tight text-slate-800">
            Gracias por tu participación
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Has completado todas las situaciones.
          </p>
        </div>
      </div>
    );
  }

  if (presentation.welcome) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8 py-16">
        <WelcomeScreen
          title={presentation.welcome.title}
          instructions={presentation.welcome.instructions}
        />
      </div>
    );
  }

  if (!presentation.currentSituation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8">
        <p className="text-center text-sm font-light text-slate-400">
          Esperando al moderador para iniciar...
        </p>
      </div>
    );
  }

  const situationNumber = Number(
    presentation.currentSituation.situationLabel.replace("Situación ", ""),
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8 py-16">
      <ScenarioCard
        situationNumber={situationNumber}
        narrative={presentation.currentSituation.narrative}
      />
    </div>
  );
}
