import type {
  Task,
  TaskExecution,
  TestSession,
  UsabilityTest,
} from "@/lib/generated/prisma/client";

import {
  getNonCriticalSeverityLabel,
  getResultLabel,
  getSatisfactionLabel,
} from "@/lib/execution-rules";
import { formatOffsetSeconds } from "@/lib/time-format";
import {
  buildReportSummary,
  formatSeconds,
  type ParticipantResultMatrix,
  type ReportSummary,
  type TaskMetrics,
} from "@/lib/analytics";

type ExecutionWithRelations = TaskExecution & {
  task: Task;
  session: TestSession & { participant: { code: string; notes: string | null } };
  findings?: Array<{
    id: string;
    title: string;
    observation: string;
    recommendation: string;
    screenshotPath: string | null;
    recordingOffsetSeconds: number | null;
  }>;
};

export type ReportInsight = {
  type: "critical" | "warning" | "success";
  title: string;
  description: string;
};

export type TaskDetailMetrics = TaskMetrics & {
  goalDescription: string;
  successCriterion: string;
  maxTimeMinutes: number;
  exceedsMaxTime: boolean;
};

export type DocumentedFinding = {
  id: string;
  title: string;
  observation: string;
  recommendation: string;
  screenshotUrl: string | null;
  recordingOffsetFormatted: string | null;
};

export type ExecutionObservation = {
  executionId: string;
  sessionId: string;
  participantCode: string;
  situationNumber: number;
  situationLabel: string;
  scenarioNarrative: string;
  goalDescription: string;
  result: string | null;
  resultLabel: string;
  taskCompleted: boolean;
  timeOnTaskSeconds: number | null;
  timeOnTaskFormatted: string;
  subjectiveSatisfaction: number | null;
  satisfactionLabel: string;
  askSatisfaction: boolean;
  thinkAloudNotes: string | null;
  helpRequested: boolean;
  isFalseCompletion: boolean;
  nonCriticalErrorCount: number;
  nonCriticalSeverityLabel: string;
  completedAt: string | null;
  findingsCount: number;
  findings: DocumentedFinding[];
};

export type SessionObservations = {
  sessionId: string;
  participantCode: string;
  participantNotes: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  recordingUrl: string | null;
  recordingNotes: string | null;
  markersCount: number;
  findingsCount: number;
  hasRecording: boolean;
  executions: ExecutionObservation[];
};

export type FrictionSituation = {
  taskId: string;
  label: string;
  shortLabel: string;
  successRate: number;
  completionRate: number;
  recoveryGap: number;
  criticalErrors: number;
  frictionScore: number;
  action: string;
};

export type ExecutiveReport = ReportSummary & {
  generatedAt: string;
  recoveryGap: number;
  autonomousSuccessRate: number;
  testMetadata: {
    startDate: string | null;
    endDate: string | null;
    status: string;
    prototypeUrl: string | null;
    userProfileCriteria: string;
    totalSituations: number;
  };
  taskDetails: TaskDetailMetrics[];
  sessionObservations: SessionObservations[];
  participantMatrix: ParticipantResultMatrix;
  frictionSituations: FrictionSituation[];
  priorityActions: ReportInsight[];
  insights: ReportInsight[];
  verdict: "favorable" | "mejorable" | "critico";
  verdictLabel: string;
};

import { TEST_STATUS_LABELS } from "@/lib/status-badges";

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateInsights(
  summary: ReportSummary,
  taskDetails: TaskDetailMetrics[],
): ReportInsight[] {
  const insights: ReportInsight[] = [];

  if (summary.totalExecutions === 0) {
    insights.push({
      type: "warning",
      title: "Sin datos de ejecución",
      description:
        "No hay sesiones completadas registradas. Ejecuta pruebas con participantes antes de tomar decisiones.",
    });
    return insights;
  }

  if (summary.overallCompletionRate >= 80) {
    insights.push({
      type: "success",
      title: "Eficacia alta (tasa de finalización)",
      description: `El ${summary.overallCompletionRate.toFixed(0)}% de las tareas fueron completadas (incluye recuperación tras errores no críticos).`,
    });
  } else if (summary.overallCompletionRate < 60) {
    insights.push({
      type: "critical",
      title: "Eficacia insuficiente",
      description: `Solo el ${summary.overallCompletionRate.toFixed(0)}% de tareas fue completada. Revisar flujos con errores críticos antes del despliegue.`,
    });
  } else {
    insights.push({
      type: "warning",
      title: "Eficacia mejorable",
      description: `El ${summary.overallCompletionRate.toFixed(0)}% de finalización sugiere barreras que impiden completar las metas.`,
    });
  }

  if (summary.overallSuccessRate >= 80) {
    insights.push({
      type: "success",
      title: "Tasa de éxito sólida",
      description: `El ${summary.overallSuccessRate.toFixed(0)}% de intentos fue exitoso sin fricción relevante.`,
    });
  } else if (summary.overallSuccessRate < 60) {
    insights.push({
      type: "warning",
      title: "Tasa de éxito baja",
      description: `Solo el ${summary.overallSuccessRate.toFixed(0)}% fue éxito puro. La experiencia requiere mejoras de usabilidad.`,
    });
  }

  if (summary.falseCompletionCount > 0) {
    insights.push({
      type: "critical",
      title: `${summary.falseCompletionCount} falsa(s) finalización(es)`,
      description:
        "Participantes creyeron haber completado la meta sin lograrlo. Revisar retroalimentación y confirmaciones del sistema.",
    });
  }

  if (summary.helpRequestedCount > 0) {
    const pct = ((summary.helpRequestedCount / summary.totalExecutions) * 100).toFixed(0);
    insights.push({
      type: "warning",
      title: `${summary.helpRequestedCount} solicitud(es) de ayuda (${pct}%)`,
      description:
        "Parte de los participantes no resolvió las situaciones de forma autónoma. Evaluar claridad de la interfaz.",
    });
  }

  if (summary.assistedSuccessCount > 0) {
    insights.push({
      type: "warning",
      title: `${summary.assistedSuccessCount} éxito(s) con asistencia`,
      description:
        "Hubo éxitos donde el participante solicitó ayuda al moderador. Diferenciar de éxito autónomo.",
    });
  }

  if (summary.totalCriticalErrors > 0) {
    const worst = [...taskDetails]
      .filter((t) => t.criticalErrors > 0)
      .sort((a, b) => b.criticalErrors - a.criticalErrors)[0];
    insights.push({
      type: "critical",
      title: `${summary.totalCriticalErrors} error(es) crítico(s) detectado(s)`,
      description: worst
        ? `Priorizar ${worst.label}: abandonos o falsas finalizaciones. Meta: "${worst.goalDescription.slice(0, 120)}…"`
        : "Hubo abandonos o falsas finalizaciones que requieren rediseño del flujo.",
    });
  }

  const slowTasks = taskDetails.filter((t) => t.exceedsMaxTime);
  if (slowTasks.length > 0) {
    insights.push({
      type: "warning",
      title: "Tiempo de tarea superado",
      description: `${slowTasks.map((t) => t.label).join(", ")} superó el tiempo máximo esperado. Evaluar simplificación o mejor señalización.`,
    });
  }

  if (summary.overallAvgSatisfaction > 0 && summary.overallAvgSatisfaction < 2.5) {
    insights.push({
      type: "critical",
      title: "Baja satisfacción",
      description: `Promedio de ${summary.overallAvgSatisfaction.toFixed(1)}/4 (escala: Nada satisfecho → Muy satisfecho).`,
    });
  } else if (summary.overallAvgSatisfaction >= 3.5) {
    insights.push({
      type: "success",
      title: "Alta satisfacción percibida",
      description: `Promedio de ${summary.overallAvgSatisfaction.toFixed(1)}/4. La experiencia subjetiva es positiva.`,
    });
  }

  const lowestCompletion = [...taskDetails].sort(
    (a, b) => a.completionRate - b.completionRate,
  )[0];
  if (
    lowestCompletion &&
    lowestCompletion.completionRate < 70 &&
    lowestCompletion.totalExecutions > 0
  ) {
    insights.push({
      type: "warning",
      title: `Punto de fricción: ${lowestCompletion.label}`,
      description: `Menor tasa de finalización (${lowestCompletion.completionRate.toFixed(0)}%). Revisar: ${lowestCompletion.goalDescription.slice(0, 100)}…`,
    });
  }

  if (summary.totalParticipants < 5) {
    insights.push({
      type: "warning",
      title: "Muestra por debajo de Nielsen",
      description: `Solo ${summary.totalParticipants} participante(s). Se recomienda 5–15 para conclusiones más robustas.`,
    });
  }

  return insights;
}

const INSIGHT_WEIGHT = { critical: 0, warning: 1, success: 2 } as const;

export function selectPriorityActions(insights: ReportInsight[], limit = 3): ReportInsight[] {
  return [...insights]
    .sort((a, b) => INSIGHT_WEIGHT[a.type] - INSIGHT_WEIGHT[b.type])
    .slice(0, limit);
}

function buildFrictionSituations(taskDetails: TaskDetailMetrics[]): FrictionSituation[] {
  return taskDetails
    .filter((task) => task.totalExecutions > 0)
    .map((task) => {
      const recoveryGap = task.completionRate - task.successRate;
      const frictionScore =
        100 -
        task.successRate +
        recoveryGap * 0.6 +
        task.criticalErrors * 15 +
        task.falseCompletionCount * 12;

      let action = "Monitorear en próxima iteración";
      if (task.criticalErrors > 0 || task.falseCompletionCount > 0) {
        action = "Rediseñar flujo y retroalimentación del sistema";
      } else if (recoveryGap > 20) {
        action = "Reducir errores recuperables y mejorar mensajes de error";
      } else if (task.successRate < 70) {
        action = "Simplificar la interfaz y reforzar señales visuales";
      } else if (task.exceedsMaxTime) {
        action = "Acortar el camino crítico o clarificar la navegación";
      }

      return {
        taskId: task.taskId,
        label: task.label,
        shortLabel: task.shortLabel,
        successRate: task.successRate,
        completionRate: task.completionRate,
        recoveryGap,
        criticalErrors: task.criticalErrors,
        frictionScore,
        action,
      };
    })
    .sort((a, b) => b.frictionScore - a.frictionScore);
}

function computeVerdict(
  summary: ReportSummary,
  insights: ReportInsight[],
): { verdict: ExecutiveReport["verdict"]; verdictLabel: string } {
  const hasCritical = insights.some((i) => i.type === "critical");
  const hasWarning = insights.some((i) => i.type === "warning");

  if (
    hasCritical ||
    summary.overallCompletionRate < 60 ||
    summary.falseCompletionCount > 0 ||
    summary.totalCriticalErrors >= 2
  ) {
    return { verdict: "critico", verdictLabel: "Requiere intervención prioritaria" };
  }

  if (
    hasWarning ||
    summary.overallCompletionRate < 80 ||
    summary.overallSuccessRate < 70 ||
    summary.overallAvgSatisfaction < 3
  ) {
    return { verdict: "mejorable", verdictLabel: "Apto con mejoras recomendadas" };
  }

  return { verdict: "favorable", verdictLabel: "Resultado favorable para avanzar" };
}

function buildSessionObservations(
  sessions: Array<
    TestSession & {
      participant: { code: string; notes: string | null };
      recordingUrl?: string | null;
      recordingNotes?: string | null;
      recordingMarkers?: Array<{ id: string }>;
    }
  >,
  executions: ExecutionWithRelations[],
): SessionObservations[] {
  return sessions
    .map((session) => {
      const sessionExecs = executions
        .filter((e) => e.sessionId === session.id && e.result !== null)
        .sort((a, b) => a.task.orderIndex - b.task.orderIndex);

      const mappedExecutions = sessionExecs.map((e) => {
        const completed =
          e.taskCompleted ?? (e.result ? e.result !== "CRITICAL_ERROR" : false);
        const findings = (e.findings ?? []).map((finding) => ({
          id: finding.id,
          title: finding.title,
          observation: finding.observation,
          recommendation: finding.recommendation,
          screenshotUrl: finding.screenshotPath
            ? `/api/evidence/${finding.screenshotPath}`
            : null,
          recordingOffsetFormatted:
            finding.recordingOffsetSeconds !== null
              ? formatOffsetSeconds(finding.recordingOffsetSeconds)
              : null,
        }));

        return {
          executionId: e.id,
          sessionId: e.sessionId,
          participantCode: e.session.participant.code,
          situationNumber: e.task.orderIndex + 1,
          situationLabel: `Situación ${e.task.orderIndex + 1}`,
          scenarioNarrative: e.task.scenarioNarrative,
          goalDescription: e.task.goalDescription,
          result: e.result,
          resultLabel: getResultLabel(e.result),
          taskCompleted: completed,
          timeOnTaskSeconds: e.timeOnTaskSeconds,
          timeOnTaskFormatted:
            e.timeOnTaskSeconds !== null ? formatSeconds(e.timeOnTaskSeconds) : "—",
          subjectiveSatisfaction: e.subjectiveSatisfaction,
          satisfactionLabel: e.task.askSatisfaction
            ? getSatisfactionLabel(e.subjectiveSatisfaction) || "—"
            : "No aplicable",
          askSatisfaction: e.task.askSatisfaction,
          thinkAloudNotes: e.thinkAloudNotes,
          helpRequested: e.helpRequested,
          isFalseCompletion: e.isFalseCompletion,
          nonCriticalErrorCount: e.nonCriticalErrorCount,
          nonCriticalSeverityLabel: getNonCriticalSeverityLabel(e.nonCriticalSeverity),
          completedAt: e.completedAt?.toISOString() ?? null,
          findingsCount: findings.length,
          findings,
        };
      });

      const findingsCount = mappedExecutions.reduce((sum, item) => sum + item.findingsCount, 0);

      return {
        sessionId: session.id,
        participantCode: session.participant.code,
        participantNotes: session.participant.notes,
        status: session.status,
        startedAt: session.startedAt?.toISOString() ?? null,
        completedAt: session.completedAt?.toISOString() ?? null,
        recordingUrl: session.recordingUrl ?? null,
        recordingNotes: session.recordingNotes ?? null,
        markersCount: session.recordingMarkers?.length ?? 0,
        findingsCount,
        hasRecording: Boolean(session.recordingUrl),
        executions: mappedExecutions,
      };
    })
    .filter((s) => s.executions.length > 0)
    .sort((a, b) => a.participantCode.localeCompare(b.participantCode));
}

export function buildExecutiveReport(
  test: UsabilityTest & { tasks: Task[] },
  executions: ExecutionWithRelations[],
  participantCount: number,
  completedSessions: number,
  sessions: Array<
    TestSession & {
      participant: { code: string; notes: string | null };
      recordingUrl?: string | null;
      recordingNotes?: string | null;
      recordingMarkers?: Array<{ id: string }>;
    }
  > = [],
): ExecutiveReport {
  const summary = buildReportSummary(
    test.projectName,
    test.tasks,
    executions,
    participantCount,
    completedSessions,
  );

  const taskDetails: TaskDetailMetrics[] = test.tasks.map((task) => {
    const metrics = summary.taskMetrics.find((m) => m.taskId === task.id)!;
    const maxSeconds = task.maxTimeMinutes * 60;
    return {
      ...metrics,
      goalDescription: task.goalDescription,
      successCriterion: task.successCriterion,
      maxTimeMinutes: task.maxTimeMinutes,
      exceedsMaxTime: metrics.avgTimeOnTaskSeconds > maxSeconds && metrics.totalExecutions > 0,
    };
  });

  const insights = generateInsights(summary, taskDetails);
  const priorityActions = selectPriorityActions(insights);
  const frictionSituations = buildFrictionSituations(taskDetails);
  const { verdict, verdictLabel } = computeVerdict(summary, insights);
  const sessionObservations = buildSessionObservations(sessions, executions);

  const autonomousSuccessCount = executions.filter(
    (e) => e.result === "SUCCESS" && !e.helpRequested,
  ).length;
  const autonomousSuccessRate =
    summary.totalExecutions > 0
      ? (autonomousSuccessCount / summary.totalExecutions) * 100
      : 0;
  const recoveryGap = summary.overallCompletionRate - summary.overallSuccessRate;

  return {
    ...summary,
    generatedAt: new Date().toISOString(),
    recoveryGap,
    autonomousSuccessRate,
    testMetadata: {
      startDate: formatDate(test.startDate),
      endDate: formatDate(test.endDate),
      status: TEST_STATUS_LABELS[test.status as keyof typeof TEST_STATUS_LABELS] ?? test.status,
      prototypeUrl: test.prototypeUrl,
      userProfileCriteria: test.userProfileCriteria,
      totalSituations: test.tasks.length,
    },
    taskDetails,
    sessionObservations,
    participantMatrix: summary.participantMatrix,
    frictionSituations,
    priorityActions,
    insights,
    verdict,
    verdictLabel,
  };
}

export function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { formatSeconds };
