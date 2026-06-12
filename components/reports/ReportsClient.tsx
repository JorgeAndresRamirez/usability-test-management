"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { ExecutiveSummaryCard } from "@/components/reports/ExecutiveSummaryCard";
import { ParticipantComparisonPanel } from "@/components/reports/ParticipantComparisonPanel";
import { ParticipantResultMatrixView } from "@/components/reports/ParticipantResultMatrix";
import { ScenarioDetailTable } from "@/components/reports/ScenarioDetailTable";
import { SessionObservationsPanel } from "@/components/reports/SessionObservationsPanel";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveReport } from "@/lib/executive-report";
import { formatSeconds } from "@/lib/executive-report";
import { getParticipantPalette } from "@/lib/participant-identity";

type ReportsClientProps = {
  testId: string;
  sessionId: string | null;
  report: ExecutiveReport;
};

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "amber" | "red" | "indigo";
}) {
  const accentClass = {
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
  }[accent ?? "indigo"];

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-semibold tracking-tight ${accentClass}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function ReportsClient({ testId, sessionId, report }: ReportsClientProps) {
  const hasData = report.totalExecutions > 0;

  const efficacyGapData = report.taskDetails.map((task) => ({
    name: task.shortLabel,
    Finalización: Math.round(task.completionRate),
    Éxito: Math.round(task.successRate),
    Brecha: Math.round(task.completionRate - task.successRate),
  }));

  const frictionData = report.frictionSituations.slice(0, 6).map((task) => ({
    name: task.shortLabel,
    Fricción: Math.round(task.frictionScore),
    action: task.action,
  }));

  const participantData = report.participantMetrics.map((p) => ({
    name: p.participantCode,
    Éxito: Math.round(p.successRate),
    Autónomo: Math.round(p.autonomousSuccessRate),
    fill: getParticipantPalette(p.participantCode).fill,
  }));

  const recoveryAccent =
    report.recoveryGap > 20 ? "red" : report.recoveryGap > 10 ? "amber" : "green";

  return (
    <>
      <TestNav testId={testId} sessionId={sessionId} />
      <PageHeader
        eyebrow="Módulo 5"
        title="Análisis y exportación"
        description="Conclusiones accionables por participante y por situación. El PDF resume qué priorizar."
        actions={
          <>
            <a
              href={`/api/tests/${testId}/reports/export/csv`}
              className={buttonVariants({ variant: "outline" })}
            >
              <FileSpreadsheet className="size-4" />
              Exportar CSV
            </a>
            <a
              href={`/api/tests/${testId}/reports/export/pdf`}
              className={buttonVariants({
                className: "bg-indigo-600 text-white hover:bg-indigo-700",
              })}
            >
              <Download className="size-4" />
              Informe ejecutivo PDF
            </a>
          </>
        }
      />

      <ExecutiveSummaryCard report={report} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="¿Se completaron las metas?"
          value={`${report.overallCompletionRate.toFixed(0)}%`}
          hint="Tasa de finalización (eficacia)"
          accent={report.overallCompletionRate >= 80 ? "green" : report.overallCompletionRate >= 60 ? "amber" : "red"}
        />
        <KpiCard
          label="¿Fue sin fricción?"
          value={`${report.overallSuccessRate.toFixed(0)}%`}
          hint="Tasa de éxito puro"
          accent={report.overallSuccessRate >= 80 ? "green" : report.overallSuccessRate >= 60 ? "amber" : "red"}
        />
        <KpiCard
          label="Brecha de recuperación"
          value={`${report.recoveryGap.toFixed(0)} pp`}
          hint="Finalización − éxito: errores recuperables"
          accent={recoveryAccent}
        />
        <KpiCard
          label="Éxito autónomo"
          value={`${report.autonomousSuccessRate.toFixed(0)}%`}
          hint="Sin solicitar ayuda al moderador"
          accent={report.autonomousSuccessRate >= 70 ? "green" : "amber"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">¿Dónde se pierde el éxito?</CardTitle>
            <p className="text-sm text-slate-500">
              Compara finalización (meta lograda) vs éxito (sin errores). La brecha indica
              situaciones donde los usuarios terminan pero con fricción.
            </p>
          </CardHeader>
          <CardContent className="h-80">
            {!hasData ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                Sin datos de ejecución todavía
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficacyGapData} barGap={2} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Finalización" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Éxito" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Prioridad de mejora por situación</CardTitle>
            <p className="text-sm text-slate-500">
              Mayor puntuación = más urgente intervenir. Combina bajo éxito, brecha de recuperación
              y errores críticos.
            </p>
          </CardHeader>
          <CardContent className="h-80">
            {!hasData ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                Sin datos de ejecución todavía
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={frictionData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={36}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [value, "Índice de fricción"]}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as { action?: string } | undefined;
                      return item?.action ?? "";
                    }}
                  />
                  <Bar dataKey="Fricción" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {participantData.length > 1 && (
          <Card className="border-slate-200/80 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">¿Todos tuvieron la misma experiencia?</CardTitle>
              <p className="text-sm text-slate-500">
                Compara éxito total vs éxito autónomo por participante. Divergencias altas sugieren
                problemas de consistencia o perfiles muy distintos.
              </p>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participantData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Éxito" radius={[4, 4, 0, 0]}>
                    {participantData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar dataKey="Autónomo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 space-y-8">
        <ParticipantComparisonPanel
          testId={testId}
          participants={report.participantMetrics}
          sessions={report.sessionObservations.map((s) => ({
            sessionId: s.sessionId,
            participantCode: s.participantCode,
            status: s.status,
          }))}
        />

        <ParticipantResultMatrixView matrix={report.participantMatrix} />

        <ScenarioDetailTable report={report} />

        <SessionObservationsPanel
          testId={testId}
          sessions={report.sessionObservations}
          participantMetrics={report.participantMetrics}
        />
      </div>
    </>
  );
}
