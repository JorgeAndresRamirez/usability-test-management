import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveReport } from "@/lib/executive-report";
import { formatReportDate } from "@/lib/executive-report";

const verdictStyles = {
  favorable: "border-green-200 bg-green-50 text-green-800",
  mejorable: "border-amber-200 bg-amber-50 text-amber-800",
  critico: "border-red-200 bg-red-50 text-red-800",
};

const insightIcons = {
  critical: AlertTriangle,
  warning: Info,
  success: CheckCircle2,
};

const insightColors = {
  critical: "text-red-600",
  warning: "text-amber-600",
  success: "text-green-600",
};

export function ExecutiveSummaryCard({ report }: { report: ExecutiveReport }) {
  const { testMetadata: meta } = report;
  const topFriction = report.frictionSituations[0];

  return (
    <Card className="mb-8 border-slate-200/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Resumen ejecutivo</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Generado el {formatReportDate(report.generatedAt)}
            </p>
          </div>
          <Badge className={verdictStyles[report.verdict]}>{report.verdictLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700">
          {report.totalExecutions === 0 ? (
            <p>
              Aún no hay datos suficientes para una conclusión. Completa al menos una sesión con
              resultados registrados.
            </p>
          ) : (
            <p>
              De <strong>{report.totalExecutions}</strong> ejecuciones en{" "}
              <strong>{report.completedSessions}</strong> sesión(es), el{" "}
              <strong>{report.overallSuccessRate.toFixed(0)}%</strong> fue éxito sin fricción y el{" "}
              <strong>{report.autonomousSuccessRate.toFixed(0)}%</strong> se resolvió sin ayuda.
              {report.recoveryGap > 10 && (
                <>
                  {" "}
                  La brecha de recuperación de{" "}
                  <strong>{report.recoveryGap.toFixed(0)} puntos</strong> indica que varios usuarios
                  completan metas pero con errores intermedios.
                </>
              )}
              {topFriction && report.verdict !== "favorable" && (
                <>
                  {" "}
                  Priorizar <strong>{topFriction.label}</strong>: {topFriction.action.toLowerCase()}.
                </>
              )}
            </p>
          )}
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Participantes</p>
            <p className="mt-1 text-slate-700">{report.totalParticipants}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Situaciones</p>
            <p className="mt-1 text-slate-700">{meta.totalSituations}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">ToT promedio</p>
            <p className="mt-1 text-slate-700">
              {report.totalExecutions > 0
                ? `${Math.floor(report.overallAvgTimeOnTaskSeconds / 60)}m ${Math.round(report.overallAvgTimeOnTaskSeconds % 60)}s`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Satisfacción</p>
            <p className="mt-1 text-slate-700">
              {report.overallAvgSatisfaction > 0
                ? `${report.overallAvgSatisfaction.toFixed(1)} / 4`
                : "—"}
            </p>
          </div>
        </div>

        {report.priorityActions.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              Acciones prioritarias
            </p>
            <ul className="space-y-3">
              {report.priorityActions.map((insight, index) => {
                const Icon = insightIcons[insight.type];
                return (
                  <li key={index} className="flex gap-3 text-sm">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${insightColors[insight.type]}`} />
                    <div>
                      <p className="font-medium text-slate-900">{insight.title}</p>
                      <p className="mt-0.5 leading-relaxed text-slate-500">{insight.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {report.insights.length > report.priorityActions.length && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-indigo-600 hover:underline">
                  Ver {report.insights.length - report.priorityActions.length} hallazgo(s)
                  adicional(es)
                </summary>
                <ul className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                  {report.insights.slice(report.priorityActions.length).map((insight, index) => {
                    const Icon = insightIcons[insight.type];
                    return (
                      <li key={index} className="flex gap-3">
                        <Icon className={`mt-0.5 size-4 shrink-0 ${insightColors[insight.type]}`} />
                        <div>
                          <p className="font-medium text-slate-900">{insight.title}</p>
                          <p className="mt-0.5 leading-relaxed text-slate-500">
                            {insight.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
