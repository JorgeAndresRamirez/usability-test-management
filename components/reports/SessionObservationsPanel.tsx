"use client";

import Link from "next/link";
import { useState } from "react";

import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ParticipantMetrics } from "@/lib/analytics";
import type { SessionObservations } from "@/lib/executive-report";
import { getParticipantPalette } from "@/lib/participant-identity";
import { cn } from "@/lib/utils";

type SessionObservationsPanelProps = {
  testId: string;
  sessions: SessionObservations[];
  participantMetrics?: ParticipantMetrics[];
};

export function SessionObservationsPanel({
  testId,
  sessions,
  participantMetrics = [],
}: SessionObservationsPanelProps) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.sessionId ?? "");

  if (sessions.length === 0) {
    return (
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Observaciones por participante</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-slate-500">
            Aún no hay sesiones con resultados registrados. Completa al menos una prueba con un
            participante para ver las observaciones aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selected = sessions.find((s) => s.sessionId === selectedSessionId) ?? sessions[0];
  const metricsByCode = new Map(
    participantMetrics.map((p) => [p.participantCode, p]),
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Observaciones por participante</CardTitle>
          <p className="text-sm text-slate-500">
            Selecciona un participante en la tabla para previsualizar sus observaciones. Usa el
            enlace para abrir el detalle completo.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Éxito</TableHead>
                <TableHead>Situaciones</TableHead>
                <TableHead>Documentación</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const metrics = metricsByCode.get(session.participantCode);
                const palette = getParticipantPalette(session.participantCode);
                const isSelected = session.sessionId === selected.sessionId;

                return (
                  <TableRow
                    key={session.sessionId}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "bg-accent/60",
                    )}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ParticipantAvatar code={session.participantCode} size="sm" />
                        <div>
                          <p className="font-medium">{session.participantCode}</p>
                          {session.participantNotes && (
                            <p className="max-w-[200px] truncate text-xs text-slate-500">
                              {session.participantNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SessionStatusBadge status={session.status} />
                    </TableCell>
                    <TableCell>
                      {metrics ? (
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            metrics.successRate >= 80
                              ? "text-green-700"
                              : metrics.successRate >= 60
                                ? "text-amber-700"
                                : "text-red-700",
                          )}
                        >
                          {metrics.successRate.toFixed(0)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{session.executions.length}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {session.hasRecording && (
                          <Badge variant="outline" className="text-xs">
                            Grabación
                          </Badge>
                        )}
                        {session.findingsCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {session.findingsCount} hallazgo
                            {session.findingsCount === 1 ? "" : "s"}
                          </Badge>
                        )}
                        {!session.hasRecording && session.findingsCount === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {session.status === "COMPLETED" && (
                          <Link
                            href={`/tests/${testId}/sessions/${session.sessionId}/synthesis`}
                            className={buttonVariants({ variant: "default", size: "sm" })}
                            onClick={(event) => event.stopPropagation()}
                          >
                            Síntesis
                          </Link>
                        )}
                        <Link
                          href={`/tests/${testId}/reports/sessions/${session.sessionId}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Ver observaciones
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={cn("border-slate-200/80 shadow-sm", getParticipantPalette(selected.participantCode).border)}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ParticipantAvatar code={selected.participantCode} />
              <div>
                <CardTitle className="text-base">
                  Vista rápida — {selected.participantCode}
                </CardTitle>
                {selected.participantNotes && (
                  <p className="mt-1 text-sm text-slate-500">{selected.participantNotes}</p>
                )}
              </div>
            </div>
            <Link
              href={`/tests/${testId}/reports/sessions/${selected.sessionId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Abrir detalle completo
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selected.executions.map((execution) => {
            const resultTone =
              execution.result === "SUCCESS"
                ? "border-green-200 bg-green-50/40"
                : execution.result === "NON_CRITICAL_ERROR"
                  ? "border-amber-200 bg-amber-50/40"
                  : execution.result === "CRITICAL_ERROR"
                    ? "border-red-200 bg-red-50/40"
                    : "border-slate-200";

            return (
              <article
                key={execution.executionId}
                className={cn("rounded-lg border p-4", resultTone)}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {execution.situationLabel}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {execution.resultLabel}
                      {execution.helpRequested && " · Solicitó ayuda"}
                      {execution.isFalseCompletion && " · Falsa finalización"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>ToT: {execution.timeOnTaskFormatted}</p>
                    {execution.askSatisfaction && execution.subjectiveSatisfaction !== null && (
                      <p>Satisfacción: {execution.satisfactionLabel}</p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {execution.thinkAloudNotes?.trim() ? (
                    execution.thinkAloudNotes
                  ) : (
                    <span className="italic text-slate-400">Sin observaciones registradas.</span>
                  )}
                </p>
              </article>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
