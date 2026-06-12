"use client";

import Link from "next/link";
import { Download, ExternalLink, Pencil } from "lucide-react";

import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { TestNav } from "@/components/layout/TestNav";
import { Badge } from "@/components/ui/badge";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SessionObservations } from "@/lib/executive-report";
import type { SessionSynthesisData } from "@/lib/synthesis";

type SessionDetailClientProps = {
  testId: string;
  projectName: string;
  session: SessionObservations;
  synthesis: SessionSynthesisData | null;
  allSessions: SessionObservations[];
};

export function SessionDetailClient({
  testId,
  projectName,
  session,
  synthesis,
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
        description={`${projectName}. Revisión detallada de cada situación, evidencias documentadas y recomendaciones.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tests/${testId}/reports`}
              className={buttonVariants({ variant: "outline" })}
            >
              Volver al informe general
            </Link>
            {session.status === "COMPLETED" && (
              <Link
                href={`/tests/${testId}/sessions/${session.sessionId}/synthesis`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Pencil className="size-4" />
                Editar síntesis
              </Link>
            )}
            <a
              href={`/api/tests/${testId}/reports/sessions/${session.sessionId}/export/findings-pdf`}
              className={buttonVariants()}
            >
              <Download className="size-4" />
              PDF para diseño
            </a>
          </div>
        }
      />

      <Card className="mb-6 border-border/70 bg-card/90 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6 text-sm">
          <ParticipantAvatar code={session.participantCode} size="lg" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Participante
            </p>
            <p className="font-medium text-foreground">{session.participantCode}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Estado
            </p>
            <SessionStatusBadge status={session.status} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Documentación
            </p>
            <p className="text-foreground">
              {session.findingsCount > 0
                ? `${session.findingsCount} hallazgo${session.findingsCount === 1 ? "" : "s"}`
                : "Sin hallazgos"}
              {session.markersCount > 0 && ` · ${session.markersCount} marcador${session.markersCount === 1 ? "" : "es"}`}
              {session.hasRecording && " · grabación vinculada"}
            </p>
          </div>
          {session.participantNotes && (
            <div className="min-w-[200px] flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Perfil
              </p>
              <p className="text-muted-foreground">{session.participantNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {(session.recordingUrl || session.recordingNotes || (synthesis?.recordingMarkers.length ?? 0) > 0) && (
        <Card className="mb-6 border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Registro audiovisual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.recordingUrl && (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Abrir grabación
              </a>
            )}
            {session.recordingNotes && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {session.recordingNotes}
              </p>
            )}
            {synthesis && synthesis.recordingMarkers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Marcadores de tiempo
                </p>
                {synthesis.recordingMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex flex-wrap items-start gap-2 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-sm"
                  >
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                      {marker.offsetFormatted}
                    </span>
                    <span className="font-medium text-foreground">{marker.label}</span>
                    {marker.situationLabel && (
                      <span className="text-xs text-muted-foreground">{marker.situationLabel}</span>
                    )}
                    {marker.notes && (
                      <p className="w-full text-muted-foreground">{marker.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
          <Card key={execution.executionId} className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{execution.situationLabel}</CardTitle>
                  <RichTextContent
                    html={execution.scenarioNarrative}
                    variant="prose"
                    className="mt-2 text-sm text-muted-foreground"
                  />
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    ToT
                  </p>
                  <p className="mt-1 font-medium">{execution.timeOnTaskFormatted}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Satisfacción
                  </p>
                  <p className="mt-1 font-medium">
                    {execution.askSatisfaction
                      ? execution.subjectiveSatisfaction !== null
                        ? execution.satisfactionLabel
                        : "—"
                      : "No aplicable"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Completada
                  </p>
                  <p className="mt-1 font-medium">{execution.taskCompleted ? "Sí" : "No"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Ayuda
                  </p>
                  <p className="mt-1 font-medium">
                    {execution.helpRequested ? "Solicitada" : "No solicitada"}
                  </p>
                </div>
              </div>

              {execution.nonCriticalErrorCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Errores no críticos: {execution.nonCriticalErrorCount}
                  {execution.nonCriticalSeverityLabel &&
                    ` (${execution.nonCriticalSeverityLabel})`}
                </p>
              )}

              {execution.isFalseCompletion && (
                <p className="text-sm text-red-700">Marcada como falsa finalización.</p>
              )}

              <Separator />

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Think aloud en vivo
                </p>
                <div className="rounded-lg bg-secondary/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {execution.thinkAloudNotes?.trim() ? (
                    execution.thinkAloudNotes
                  ) : (
                    <span className="italic text-muted-foreground">
                      No se registraron observaciones para esta situación.
                    </span>
                  )}
                </div>
              </div>

              {execution.findings.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Hallazgos documentados
                  </p>
                  {execution.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="space-y-3 rounded-xl border border-border/70 bg-card p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{finding.title}</p>
                        {finding.recordingOffsetFormatted && (
                          <p className="mt-1 font-mono text-xs text-primary">
                            {finding.recordingOffsetFormatted} en la grabación
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Observación
                        </p>
                        <p className="text-sm leading-relaxed">{finding.observation}</p>
                      </div>
                      <div className="rounded-lg border border-primary/20 bg-accent/40 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                          Recomendación
                        </p>
                        <p className="text-sm leading-relaxed">{finding.recommendation}</p>
                      </div>
                      {finding.screenshotUrl && (
                        <div className="overflow-hidden rounded-lg border border-border/70">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={finding.screenshotUrl}
                            alt={finding.title}
                            className="max-h-64 w-full object-contain bg-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
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
