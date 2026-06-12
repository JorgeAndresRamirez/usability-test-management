import Link from "next/link";

import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParticipantMetrics } from "@/lib/analytics";
import { formatSeconds } from "@/lib/executive-report";
import { getParticipantPalette } from "@/lib/participant-identity";
import { cn } from "@/lib/utils";

type ParticipantComparisonPanelProps = {
  testId: string;
  participants: ParticipantMetrics[];
  sessions: Array<{ sessionId: string; participantCode: string; status: string }>;
};

function MetricPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  const toneClass = {
    good: "text-green-700 bg-green-50",
    warn: "text-amber-700 bg-amber-50",
    bad: "text-red-700 bg-red-50",
    neutral: "text-slate-700 bg-slate-50",
  }[tone];

  return (
    <div className={cn("rounded-md px-2.5 py-1.5 text-center", toneClass)}>
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

export function ParticipantComparisonPanel({
  testId,
  participants,
  sessions,
}: ParticipantComparisonPanelProps) {
  if (participants.length === 0) return null;

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Comparación entre participantes</CardTitle>
        <p className="text-sm text-slate-500">
          Vista rápida del desempeño individual. Abre el detalle para revisar observaciones
          situación por situación.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {participants.map((participant) => {
          const palette = getParticipantPalette(participant.participantCode);
          const session = sessions.find(
            (s) => s.participantCode === participant.participantCode,
          );
          const successTone =
            participant.successRate >= 80
              ? "good"
              : participant.successRate >= 60
                ? "warn"
                : "bad";

          return (
            <article
              key={participant.participantCode}
              className={cn(
                "rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
                palette.border,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ParticipantAvatar code={participant.participantCode} />
                  <div>
                    <p className="font-semibold text-slate-900">{participant.participantCode}</p>
                    {participant.participantNotes && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {participant.participantNotes}
                      </p>
                    )}
                  </div>
                </div>
                {session && <SessionStatusBadge status={session.status} />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MetricPill
                  label="Éxito"
                  value={`${participant.successRate.toFixed(0)}%`}
                  tone={successTone}
                />
                <MetricPill
                  label="Autónomo"
                  value={`${participant.autonomousSuccessRate.toFixed(0)}%`}
                  tone={
                    participant.autonomousSuccessRate >= 70
                      ? "good"
                      : participant.autonomousSuccessRate >= 50
                        ? "warn"
                        : "bad"
                  }
                />
                <MetricPill
                  label="ToT prom."
                  value={formatSeconds(participant.avgTimeOnTaskSeconds)}
                />
                <MetricPill
                  label="Satisf."
                  value={
                    participant.avgSatisfaction > 0
                      ? `${participant.avgSatisfaction.toFixed(1)}/4`
                      : "—"
                  }
                />
              </div>

              {(participant.criticalErrors > 0 ||
                participant.helpRequestedCount > 0 ||
                participant.falseCompletionCount > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {participant.criticalErrors > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                      {participant.criticalErrors} crítico(s)
                    </span>
                  )}
                  {participant.helpRequestedCount > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                      {participant.helpRequestedCount} ayuda
                    </span>
                  )}
                  {participant.falseCompletionCount > 0 && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">
                      {participant.falseCompletionCount} falsa fin.
                    </span>
                  )}
                </div>
              )}

              {session && (
                <div className="mt-4">
                  <Link
                    href={`/tests/${testId}/reports/sessions/${session.sessionId}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
                  >
                    Ver detalle completo
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
