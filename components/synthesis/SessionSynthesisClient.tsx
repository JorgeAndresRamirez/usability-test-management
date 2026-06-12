"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

import { ExecutionFindingsEditor } from "@/components/synthesis/ExecutionFindingsEditor";
import { RecordingMarkersEditor } from "@/components/synthesis/RecordingMarkersEditor";
import { SessionRecordingSection } from "@/components/synthesis/SessionRecordingSection";
import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import type { SessionSynthesisData, SynthesisMarker } from "@/lib/synthesis";

type SessionSynthesisClientProps = {
  initialSynthesis: SessionSynthesisData;
};

export function SessionSynthesisClient({ initialSynthesis }: SessionSynthesisClientProps) {
  const [synthesis, setSynthesis] = useState(initialSynthesis);

  const updateStats = (next: Partial<SessionSynthesisData>) => {
    const merged = { ...synthesis, ...next };
    setSynthesis({
      ...merged,
      stats: {
        findingsCount: merged.executions.reduce(
          (sum, execution) => sum + execution.findings.length,
          0,
        ),
        markersCount: merged.recordingMarkers.length,
        hasRecording: Boolean(merged.recordingUrl),
      },
    });
  };

  const statsLabel = [
    synthesis.stats.findingsCount > 0
      ? `${synthesis.stats.findingsCount} hallazgo${synthesis.stats.findingsCount === 1 ? "" : "s"}`
      : null,
    synthesis.stats.markersCount > 0
      ? `${synthesis.stats.markersCount} marcador${synthesis.stats.markersCount === 1 ? "" : "es"}`
      : null,
    synthesis.stats.hasRecording ? "grabación vinculada" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <TestNav testId={synthesis.testId} sessionId={synthesis.sessionId} />
      <PageHeader
        eyebrow="Síntesis post-sesión"
        title={`Documentar hallazgos — ${synthesis.participantCode}`}
        description={`${synthesis.projectName}. Revisa la grabación y documenta evidencias concretas para el equipo de diseño y desarrollo.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tests/${synthesis.testId}/reports/sessions/${synthesis.sessionId}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <FileText className="size-4" />
              Ver observaciones
            </Link>
            <a
              href={`/api/tests/${synthesis.testId}/reports/sessions/${synthesis.sessionId}/export/findings-pdf`}
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
          <ParticipantAvatar code={synthesis.participantCode} size="lg" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Participante
            </p>
            <p className="font-medium text-foreground">{synthesis.participantCode}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Estado
            </p>
            <SessionStatusBadge status={synthesis.status} />
          </div>
          <div className="min-w-[200px] flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Documentación
            </p>
            <p className="text-foreground">{statsLabel || "Sin documentar aún"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Registro audiovisual</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionRecordingSection
              sessionId={synthesis.sessionId}
              recordingUrl={synthesis.recordingUrl}
              recordingNotes={synthesis.recordingNotes}
              onChange={({ recordingUrl, recordingNotes }) =>
                updateStats({ recordingUrl, recordingNotes })
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Marcadores de tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordingMarkersEditor
              sessionId={synthesis.sessionId}
              markers={synthesis.recordingMarkers}
              executions={synthesis.executions}
              onChange={(recordingMarkers: SynthesisMarker[]) => updateStats({ recordingMarkers })}
            />
          </CardContent>
        </Card>

        {synthesis.executions.map((execution) => (
          <Card key={execution.executionId} className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">{execution.situationLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutionFindingsEditor
                sessionId={synthesis.sessionId}
                execution={execution}
                onChange={(findings) =>
                  updateStats({
                    executions: synthesis.executions.map((item) =>
                      item.executionId === execution.executionId ? { ...item, findings } : item,
                    ),
                  })
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
