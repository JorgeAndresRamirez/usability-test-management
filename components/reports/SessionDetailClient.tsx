"use client";

import Link from "next/link";

import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { Badge } from "@/components/ui/badge";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SessionObservations } from "@/lib/executive-report";

type SessionDetailClientProps = {
  testId: string;
  projectName: string;
  session: SessionObservations;
  allSessions: SessionObservations[];
};

export function SessionDetailClient({
  testId,
  projectName,
  session,
  allSessions,
}: SessionDetailClientProps) {
  const currentIndex = allSessions.findIndex((s) => s.sessionId === session.sessionId);
  const prevSession = currentIndex > 0 ? allSessions[currentIndex - 1] : null;
  const nextSession =
    currentIndex >= 0 && currentIndex < allSessions.length - 1
      ? allSessions[currentIndex + 1]
      : null;

  return (
    <>
      <TestNav testId={testId} sessionId={session.sessionId} />
      <PageHeader
        eyebrow="Módulo 5"
        title={`Observaciones — ${session.participantCode}`}
        description={`${projectName}. Revisión detallada de cada situación y las notas del moderador.`}
        actions={
          <Link href={`/tests/${testId}/reports`} className={buttonVariants({ variant: "outline" })}>
            Volver al informe general
          </Link>
        }
      />

      <Card className="mb-6 border-slate-200/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6 text-sm">
          <ParticipantAvatar code={session.participantCode} size="lg" />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Participante</p>
            <p className="font-medium text-slate-900">{session.participantCode}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Estado</p>
            <SessionStatusBadge status={session.status} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Situaciones</p>
            <p className="font-medium text-slate-900">{session.executions.length}</p>
          </div>
          {session.participantNotes && (
            <div className="min-w-[200px] flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-400">Perfil</p>
              <p className="text-slate-700">{session.participantNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {prevSession && (
          <Link
            href={`/tests/${testId}/reports/sessions/${prevSession.sessionId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← {prevSession.participantCode}
          </Link>
        )}
        {nextSession && (
          <Link
            href={`/tests/${testId}/reports/sessions/${nextSession.sessionId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {nextSession.participantCode} →
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {session.executions.map((execution, index) => (
          <Card key={execution.executionId} className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{execution.situationLabel}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {execution.scenarioNarrative}
                  </p>
                </div>
                <Badge
                  variant={
                    execution.result === "SUCCESS"
                      ? "success"
                      : execution.result === "NON_CRITICAL_ERROR"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {execution.resultLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">ToT</p>
                  <p className="mt-1 font-medium">{execution.timeOnTaskFormatted}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Satisfacción</p>
                  <p className="mt-1 font-medium">
                    {execution.askSatisfaction
                      ? execution.subjectiveSatisfaction !== null
                        ? execution.satisfactionLabel
                        : "—"
                      : "No aplicable"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Completada</p>
                  <p className="mt-1 font-medium">{execution.taskCompleted ? "Sí" : "No"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Ayuda</p>
                  <p className="mt-1 font-medium">
                    {execution.helpRequested ? "Solicitada" : "No solicitada"}
                  </p>
                </div>
              </div>

              {execution.nonCriticalErrorCount > 0 && (
                <p className="text-sm text-slate-600">
                  Errores no críticos: {execution.nonCriticalErrorCount}
                  {execution.nonCriticalSeverityLabel &&
                    ` (${execution.nonCriticalSeverityLabel})`}
                </p>
              )}

              {execution.isFalseCompletion && (
                <p className="text-sm text-red-600">Marcada como falsa finalización.</p>
              )}

              <Separator />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Think Aloud y observaciones del moderador
                </p>
                <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {execution.thinkAloudNotes?.trim() ? (
                    execution.thinkAloudNotes
                  ) : (
                    <span className="italic text-slate-400">
                      No se registraron observaciones para esta situación.
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Meta evaluada: {execution.goalDescription}
              </div>

              {index < session.executions.length - 1 && <Separator />}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
