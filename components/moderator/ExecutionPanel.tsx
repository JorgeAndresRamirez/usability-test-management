"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ExecutionOutcomeForm,
  type ExecutionOutcome,
} from "@/components/moderator/ExecutionOutcomeForm";
import { InvisibleTimer } from "@/components/moderator/InvisibleTimer";
import { SatisfactionSelector } from "@/components/moderator/SatisfactionSelector";
import { WelcomeScreen } from "@/components/participant/WelcomeScreen";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ModeratorTask } from "@/lib/types/moderator";

const emptyOutcome: ExecutionOutcome = {
  result: null,
  nonCriticalErrorCount: 1,
  nonCriticalSeverity: null,
  isFalseCompletion: false,
  helpRequested: null,
};

type ExecutionPanelProps = {
  sessionId: string;
  testId: string;
  participantCode: string;
  tasks: ModeratorTask[];
  currentTaskIndex: number;
  sessionStatus: string;
  welcomeEnabled: boolean;
  welcomeTitle: string;
  welcomeInstructions: string;
  onSessionUpdate: () => Promise<void>;
};

type SavedExecution = {
  id: string;
  result: "SUCCESS" | "NON_CRITICAL_ERROR" | "CRITICAL_ERROR" | null;
  timeOnTaskSeconds: number | null;
  subjectiveSatisfaction: number | null;
  nonCriticalErrorCount: number;
  nonCriticalSeverity: "MILD" | "SEVERE" | null;
  isFalseCompletion: boolean;
  helpRequested: boolean;
  thinkAloudNotes: string | null;
};

function applySavedExecution(
  execution: SavedExecution,
  setters: {
    setOutcome: (value: ExecutionOutcome) => void;
    setSatisfaction: (value: number | null) => void;
    setNotes: (value: string) => void;
    setElapsedSeconds: (value: number) => void;
    setExecutionId: (value: string) => void;
    setIsSaved: (value: boolean) => void;
    setIsActive: (value: boolean) => void;
  },
) {
  setters.setExecutionId(execution.id);
  if (execution.thinkAloudNotes) {
    setters.setNotes(execution.thinkAloudNotes);
  }
  if (execution.timeOnTaskSeconds !== null) {
    setters.setElapsedSeconds(execution.timeOnTaskSeconds);
  }
  if (execution.result) {
    setters.setOutcome({
      result: execution.result,
      nonCriticalErrorCount: Math.max(execution.nonCriticalErrorCount, 1),
      nonCriticalSeverity: execution.nonCriticalSeverity,
      isFalseCompletion: execution.isFalseCompletion,
      helpRequested: execution.helpRequested,
    });
    setters.setSatisfaction(execution.subjectiveSatisfaction);
    setters.setIsSaved(true);
    setters.setIsActive(false);
  }
}

type WelcomePhasePanelProps = {
  sessionId: string;
  participantCode: string;
  sessionStatus: string;
  welcomeTitle: string;
  welcomeInstructions: string;
  onSessionUpdate: () => Promise<void>;
};

function WelcomePhasePanel({
  sessionId,
  participantCode,
  sessionStatus,
  welcomeTitle,
  welcomeInstructions,
  onSessionUpdate,
}: WelcomePhasePanelProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleStartSession = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTask: true }),
      });
      await onSessionUpdate();
      toast.success("Sesión iniciada — el participante ve la bienvenida");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartFirstSituation = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startFirstSituation: true }),
      });
      await onSessionUpdate();
      toast.success("Primera situación iniciada");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>Bienvenida — {participantCode}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            El participante verá las indicaciones configuradas antes del primer escenario. Cuando
            esté listo, avanza a la situación 1.
          </p>
          {sessionStatus === "PENDING" ? (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleStartSession}
              disabled={isSaving}
            >
              Iniciar sesión (mostrar bienvenida)
            </Button>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleStartFirstSituation}
              disabled={isSaving}
            >
              Iniciar primera situación
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Vista participante</CardTitle>
        </CardHeader>
        <CardContent>
          <WelcomeScreen title={welcomeTitle} instructions={welcomeInstructions} preview />
        </CardContent>
      </Card>
    </div>
  );
}

type ExecutionTaskWorkspaceProps = {
  sessionId: string;
  participantCode: string;
  currentTask: ModeratorTask;
  totalTasks: number;
  sessionStatus: string;
  onSessionUpdate: () => Promise<void>;
};

function ExecutionTaskWorkspace({
  sessionId,
  participantCode,
  currentTask,
  totalTasks,
  sessionStatus,
  onSessionUpdate,
}: ExecutionTaskWorkspaceProps) {
  const [outcome, setOutcome] = useState<ExecutionOutcome>(emptyOutcome);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isActive, setIsActive] = useState(sessionStatus === "IN_PROGRESS");

  const isLastTask = currentTask.orderIndex >= totalTasks - 1;

  const applyFromApi = useCallback(
    (execution: SavedExecution) => {
      applySavedExecution(execution, {
        setOutcome,
        setSatisfaction,
        setNotes,
        setElapsedSeconds,
        setExecutionId,
        setIsSaved,
        setIsActive,
      });
    },
    [],
  );

  const loadCurrentExecution = useCallback(async () => {
    const response = await fetch(`/api/sessions/${sessionId}`);
    if (!response.ok) return;
    const data = await response.json();
    const execution = data.executions?.find(
      (item: { taskId: string }) => item.taskId === currentTask.id,
    ) as SavedExecution | undefined;
    if (execution) {
      applyFromApi(execution);
    }
  }, [sessionId, currentTask.id, applyFromApi]);

  useEffect(() => {
    if (sessionStatus !== "IN_PROGRESS") return;

    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok || cancelled) return;
      const data = await response.json();
      const execution = data.executions?.find(
        (item: { taskId: string }) => item.taskId === currentTask.id,
      ) as SavedExecution | undefined;
      if (!execution || cancelled) return;
      applyFromApi(execution);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, sessionId, currentTask.id, applyFromApi]);

  useEffect(() => {
    if (!executionId || notes.length === 0) return;

    const timeout = setTimeout(async () => {
      await fetch(`/api/sessions/${sessionId}/executions/${executionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thinkAloudNotes: notes }),
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [notes, executionId, sessionId]);

  const satisfactionReady =
    !currentTask.askSatisfaction || satisfaction !== null;

  const canComplete =
    outcome.result !== null &&
    satisfactionReady &&
    outcome.helpRequested !== null &&
    (outcome.result !== "NON_CRITICAL_ERROR" || outcome.nonCriticalErrorCount >= 1);

  const handleStart = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTask: true }),
      });
      setIsActive(true);
      await onSessionUpdate();
      await loadCurrentExecution();
      toast.success("Situación iniciada");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStopTimer = () => {
    setIsActive(false);
    toast.success("Cronómetro detenido — puedes seguir registrando observaciones");
  };

  const handleSave = async () => {
    if (!canComplete || !outcome.result || outcome.helpRequested === null) {
      toast.error(
        currentTask.askSatisfaction
          ? "Completa resultado, ayuda solicitada y satisfacción antes de guardar"
          : "Completa resultado y ayuda solicitada antes de guardar",
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: currentTask.id,
          result: outcome.result,
          timeOnTaskSeconds: elapsedSeconds,
          subjectiveSatisfaction: currentTask.askSatisfaction ? satisfaction : null,
          thinkAloudNotes: notes,
          nonCriticalErrorCount: outcome.nonCriticalErrorCount,
          nonCriticalSeverity: outcome.nonCriticalSeverity,
          isFalseCompletion: outcome.isFalseCompletion,
          helpRequested: outcome.helpRequested,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la ejecución");
      }

      const execution = await response.json();
      setExecutionId(execution.id);
      setIsActive(false);
      setIsSaved(true);
      toast.success("Situación guardada — continúa editando o avanza cuando estés listo");
    } catch {
      toast.error("Error al guardar los datos");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!isSaved) {
      toast.error("Guarda la situación antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advanceTask: true }),
      });
      await onSessionUpdate();
      toast.success(isLastTask ? "Sesión finalizada" : "Siguiente situación");
    } catch {
      toast.error("Error al avanzar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Situación {currentTask.orderIndex + 1} — {participantCode}
              </CardTitle>
              <Badge variant="muted">Ficha técnica privada</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <Label className="text-slate-500">Punto de partida</Label>
              <p className="mt-1 text-slate-900">{currentTask.startPoint}</p>
            </div>
            <div>
              <Label className="text-slate-500">Meta</Label>
              <p className="mt-1 text-slate-900">{currentTask.goalDescription}</p>
            </div>
            <div>
              <Label className="text-slate-500">Criterio de éxito</Label>
              <p className="mt-1 text-slate-900">{currentTask.successCriterion}</p>
            </div>
            <div>
              <Label className="text-slate-500">Tiempo máximo</Label>
              <p className="mt-1 text-slate-900">{currentTask.maxTimeMinutes} minutos</p>
            </div>
            <div>
              <Label className="text-slate-500">Satisfacción</Label>
              <p className="mt-1 text-slate-900">
                {currentTask.askSatisfaction
                  ? "Se preguntará al cerrar esta situación"
                  : "No configurada para esta situación"}
              </p>
            </div>
          </CardContent>
        </Card>

        <InvisibleTimer
          maxMinutes={currentTask.maxTimeMinutes}
          isActive={isActive}
          resetKey={`${sessionId}-${currentTask.id}`}
          onSecondsChange={setElapsedSeconds}
        />

        {sessionStatus === "PENDING" ? (
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleStart}
            disabled={isSaving}
          >
            Iniciar situación
          </Button>
        ) : (
          <div className="space-y-2">
            {isSaved && (
              <Badge variant="success">
                Situación guardada
              </Badge>
            )}
            {isActive && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleStopTimer}
                disabled={isSaving}
              >
                Detener cronómetro
              </Button>
            )}
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={isSaving || !canComplete}
            >
              {isSaved ? "Actualizar registro" : "Guardar situación"}
            </Button>
            {isSaved && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleNext}
                disabled={isSaving}
              >
                {isLastTask ? "Finalizar sesión" : "Siguiente situación"}
              </Button>
            )}
            <p className="text-center text-xs text-slate-500">
              Guarda el tiempo y las métricas cuando el participante termine. Avanza al siguiente
              escenario solo cuando hayas completado tus observaciones.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>Observaciones en vivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thinkAloud">Think Aloud y comportamiento</Label>
              <Textarea
                id="thinkAloud"
                rows={6}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anota pensamientos en voz alta, dudas, gestos y observaciones..."
                disabled={sessionStatus === "PENDING"}
              />
            </div>

            <Separator />

            <ExecutionOutcomeForm
              value={outcome}
              onChange={setOutcome}
              disabled={sessionStatus === "PENDING"}
            />

            <Separator />

            {currentTask.askSatisfaction ? (
              <>
                <SatisfactionSelector
                  value={satisfaction}
                  onChange={setSatisfaction}
                  disabled={sessionStatus === "PENDING"}
                />
              </>
            ) : (
              <p className="text-sm text-slate-500">
                La satisfacción no está activada para esta situación. Puedes habilitarla en el
                Constructor al editar la ficha técnica.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ExecutionPanel({
  sessionId,
  testId,
  participantCode,
  tasks,
  currentTaskIndex,
  sessionStatus,
  welcomeEnabled,
  welcomeTitle,
  welcomeInstructions,
  onSessionUpdate,
}: ExecutionPanelProps) {
  const isWelcomePhase = welcomeEnabled && currentTaskIndex === -1;
  const isCompleted =
    sessionStatus === "COMPLETED" || currentTaskIndex >= tasks.length;
  const currentTask = tasks.find((task) => task.orderIndex === currentTaskIndex);

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-semibold text-slate-900">Sesión completada</p>
          <p className="mt-2 text-slate-500">
            Todas las situaciones de {participantCode} han sido registradas.
          </p>
          <Link
            href={`/tests/${testId}/reports/sessions/${sessionId}`}
            className={buttonVariants({
              className: "mt-6",
            })}
          >
            Ver observaciones de {participantCode}
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isWelcomePhase) {
    return (
      <WelcomePhasePanel
        sessionId={sessionId}
        participantCode={participantCode}
        sessionStatus={sessionStatus}
        welcomeTitle={welcomeTitle}
        welcomeInstructions={welcomeInstructions}
        onSessionUpdate={onSessionUpdate}
      />
    );
  }

  if (!currentTask) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          No hay situaciones configuradas para este test.
        </CardContent>
      </Card>
    );
  }

  return (
    <ExecutionTaskWorkspace
      key={`${sessionId}-${currentTaskIndex}`}
      sessionId={sessionId}
      participantCode={participantCode}
      currentTask={currentTask}
      totalTasks={tasks.length}
      sessionStatus={sessionStatus}
      onSessionUpdate={onSessionUpdate}
    />
  );
}
