import type { Task, TaskExecution, TaskResult, TestSession } from "@/lib/generated/prisma/client";

import { deriveTaskCompleted, getSatisfactionLabel } from "@/lib/execution-rules";

export type ParticipantMetrics = {
  participantCode: string;
  sessionId: string;
  participantNotes: string | null;
  completionRate: number;
  successRate: number;
  autonomousSuccessRate: number;
  avgTimeOnTaskSeconds: number;
  avgSatisfaction: number;
  criticalErrors: number;
  helpRequestedCount: number;
  falseCompletionCount: number;
  executionCount: number;
};

export type ResultMatrixCell = {
  taskId: string;
  orderIndex: number;
  situationLabel: string;
  result: TaskResult | null;
  taskCompleted: boolean;
  helpRequested: boolean;
  isFalseCompletion: boolean;
};

export type ParticipantResultRow = {
  participantCode: string;
  sessionId: string;
  participantNotes: string | null;
  metrics: ParticipantMetrics;
  cells: ResultMatrixCell[];
};

export type ParticipantResultMatrix = {
  situations: Array<{ taskId: string; orderIndex: number; label: string }>;
  rows: ParticipantResultRow[];
};

export type TaskMetrics = {
  taskId: string;
  orderIndex: number;
  label: string;
  shortLabel: string;
  completionRate: number;
  successRate: number;
  avgTimeOnTaskSeconds: number;
  criticalErrors: number;
  nonCriticalErrors: number;
  avgNonCriticalErrorCount: number;
  falseCompletionCount: number;
  helpRequestedCount: number;
  assistedSuccessCount: number;
  avgSatisfaction: number;
  totalExecutions: number;
};

export type ReportSummary = {
  projectName: string;
  totalParticipants: number;
  completedSessions: number;
  totalExecutions: number;
  overallCompletionRate: number;
  overallSuccessRate: number;
  overallAvgTimeOnTaskSeconds: number;
  totalCriticalErrors: number;
  totalNonCriticalErrors: number;
  falseCompletionCount: number;
  helpRequestedCount: number;
  assistedSuccessCount: number;
  overallAvgSatisfaction: number;
  taskMetrics: TaskMetrics[];
  participantMetrics: ParticipantMetrics[];
  participantMatrix: ParticipantResultMatrix;
};

type ExecutionWithRelations = TaskExecution & {
  task: Task;
  session: TestSession & { participant: { code: string; notes: string | null } };
};

function isCompleted(execution: ExecutionWithRelations): boolean {
  if (execution.taskCompleted !== null && execution.taskCompleted !== undefined) {
    return execution.taskCompleted;
  }
  if (execution.result) {
    return deriveTaskCompleted(execution.result);
  }
  return false;
}

function buildTaskMetrics(task: Task, taskExecs: ExecutionWithRelations[]): TaskMetrics {
  const successCount = taskExecs.filter((e) => e.result === "SUCCESS").length;
  const completedCount = taskExecs.filter((e) => isCompleted(e)).length;
  const ncExecs = taskExecs.filter((e) => e.result === "NON_CRITICAL_ERROR");

  return {
    taskId: task.id,
    orderIndex: task.orderIndex,
    label: `Situación ${task.orderIndex + 1}`,
    shortLabel: `S${task.orderIndex + 1}`,
    completionRate:
      taskExecs.length > 0 ? (completedCount / taskExecs.length) * 100 : 0,
    successRate: taskExecs.length > 0 ? (successCount / taskExecs.length) * 100 : 0,
    avgTimeOnTaskSeconds:
      taskExecs.length > 0
        ? taskExecs.reduce((sum, e) => sum + (e.timeOnTaskSeconds ?? 0), 0) / taskExecs.length
        : 0,
    criticalErrors: taskExecs.filter((e) => e.result === "CRITICAL_ERROR").length,
    nonCriticalErrors: ncExecs.length,
    avgNonCriticalErrorCount:
      ncExecs.length > 0
        ? ncExecs.reduce((sum, e) => sum + e.nonCriticalErrorCount, 0) / ncExecs.length
        : 0,
    falseCompletionCount: taskExecs.filter((e) => e.isFalseCompletion).length,
    helpRequestedCount: taskExecs.filter((e) => e.helpRequested).length,
    assistedSuccessCount: taskExecs.filter(
      (e) => e.result === "SUCCESS" && e.helpRequested,
    ).length,
    avgSatisfaction:
      taskExecs.filter((e) => e.subjectiveSatisfaction !== null).length > 0
        ? taskExecs.reduce((sum, e) => sum + (e.subjectiveSatisfaction ?? 0), 0) /
          taskExecs.filter((e) => e.subjectiveSatisfaction !== null).length
        : 0,
    totalExecutions: taskExecs.length,
  };
}

export function buildReportSummary(
  projectName: string,
  tasks: Task[],
  executions: ExecutionWithRelations[],
  participantCount: number,
  completedSessions: number,
): ReportSummary {
  const completed = executions.filter((e) => e.result !== null);

  const overallCompletionRate =
    completed.length > 0
      ? (completed.filter((e) => isCompleted(e)).length / completed.length) * 100
      : 0;

  const overallSuccessRate =
    completed.length > 0
      ? (completed.filter((e) => e.result === "SUCCESS").length / completed.length) * 100
      : 0;

  const overallAvgTimeOnTaskSeconds =
    completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.timeOnTaskSeconds ?? 0), 0) / completed.length
      : 0;

  const totalCriticalErrors = completed.filter(
    (e) => e.result === "CRITICAL_ERROR",
  ).length;
  const totalNonCriticalErrors = completed.filter(
    (e) => e.result === "NON_CRITICAL_ERROR",
  ).length;
  const falseCompletionCount = completed.filter((e) => e.isFalseCompletion).length;
  const helpRequestedCount = completed.filter((e) => e.helpRequested).length;
  const assistedSuccessCount = completed.filter(
    (e) => e.result === "SUCCESS" && e.helpRequested,
  ).length;

  const satisfactionValues = completed
    .map((e) => e.subjectiveSatisfaction)
    .filter((v): v is number => v !== null);
  const overallAvgSatisfaction =
    satisfactionValues.length > 0
      ? satisfactionValues.reduce((a, b) => a + b, 0) / satisfactionValues.length
      : 0;

  const taskMetrics = tasks.map((task) => {
    const taskExecs = completed.filter((e) => e.taskId === task.id);
    return buildTaskMetrics(task, taskExecs);
  });

  const participantCodes = [...new Set(executions.map((e) => e.session.participant.code))].sort();

  const participantMetrics: ParticipantMetrics[] = participantCodes.map((code) => {
    const pExecs = completed.filter((e) => e.session.participant.code === code);
    const successCount = pExecs.filter((e) => e.result === "SUCCESS").length;
    const completedCount = pExecs.filter((e) => isCompleted(e)).length;
    const autonomousSuccessCount = pExecs.filter(
      (e) => e.result === "SUCCESS" && !e.helpRequested,
    ).length;
    const session = pExecs[0]?.session;

    return {
      participantCode: code,
      sessionId: session?.id ?? "",
      participantNotes: session?.participant.notes ?? null,
      completionRate: pExecs.length > 0 ? (completedCount / pExecs.length) * 100 : 0,
      successRate: pExecs.length > 0 ? (successCount / pExecs.length) * 100 : 0,
      autonomousSuccessRate:
        pExecs.length > 0 ? (autonomousSuccessCount / pExecs.length) * 100 : 0,
      avgTimeOnTaskSeconds:
        pExecs.length > 0
          ? pExecs.reduce((sum, e) => sum + (e.timeOnTaskSeconds ?? 0), 0) / pExecs.length
          : 0,
      avgSatisfaction:
        pExecs.filter((e) => e.subjectiveSatisfaction !== null).length > 0
          ? pExecs.reduce((sum, e) => sum + (e.subjectiveSatisfaction ?? 0), 0) /
            pExecs.filter((e) => e.subjectiveSatisfaction !== null).length
          : 0,
      criticalErrors: pExecs.filter((e) => e.result === "CRITICAL_ERROR").length,
      helpRequestedCount: pExecs.filter((e) => e.helpRequested).length,
      falseCompletionCount: pExecs.filter((e) => e.isFalseCompletion).length,
      executionCount: pExecs.length,
    };
  });

  const participantMatrix = buildParticipantResultMatrix(tasks, completed, participantMetrics);

  return {
    projectName,
    totalParticipants: participantCount,
    completedSessions,
    totalExecutions: completed.length,
    overallCompletionRate,
    overallSuccessRate,
    overallAvgTimeOnTaskSeconds,
    totalCriticalErrors,
    totalNonCriticalErrors,
    falseCompletionCount,
    helpRequestedCount,
    assistedSuccessCount,
    overallAvgSatisfaction,
    taskMetrics,
    participantMetrics,
    participantMatrix,
  };
}

function buildParticipantResultMatrix(
  tasks: Task[],
  completed: ExecutionWithRelations[],
  participantMetrics: ParticipantMetrics[],
): ParticipantResultMatrix {
  const situations = tasks.map((task) => ({
    taskId: task.id,
    orderIndex: task.orderIndex,
    label: `S${task.orderIndex + 1}`,
  }));

  const rows = participantMetrics.map((metrics) => {
    const cells = tasks.map((task) => {
      const execution = completed.find(
        (e) =>
          e.taskId === task.id && e.session.participant.code === metrics.participantCode,
      );

      const taskCompleted =
        execution?.taskCompleted ??
        (execution?.result ? deriveTaskCompleted(execution.result) : false);

      return {
        taskId: task.id,
        orderIndex: task.orderIndex,
        situationLabel: `S${task.orderIndex + 1}`,
        result: execution?.result ?? null,
        taskCompleted,
        helpRequested: execution?.helpRequested ?? false,
        isFalseCompletion: execution?.isFalseCompletion ?? false,
      };
    });

    return {
      participantCode: metrics.participantCode,
      sessionId: metrics.sessionId,
      participantNotes: metrics.participantNotes,
      metrics,
      cells,
    };
  });

  return { situations, rows };
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function executionsToCsv(executions: ExecutionWithRelations[]): string {
  const header = [
    "participante",
    "situacion",
    "resultado",
    "completada",
    "errores_no_criticos",
    "gravedad_error",
    "falsa_finalizacion",
    "solicito_ayuda",
    "time_on_task_segundos",
    "satisfaccion",
    "satisfaccion_etiqueta",
    "notas",
    "inicio",
    "fin",
  ].join(",");

  const rows = executions.map((e) => {
    const completed =
      e.taskCompleted ?? (e.result ? deriveTaskCompleted(e.result) : false);
    return [
      e.session.participant.code,
      e.task.orderIndex + 1,
      e.result ?? "",
      completed ? "si" : "no",
      e.nonCriticalErrorCount,
      e.nonCriticalSeverity ?? "",
      e.isFalseCompletion ? "si" : "no",
      e.helpRequested ? "si" : "no",
      e.timeOnTaskSeconds ?? "",
      e.subjectiveSatisfaction ?? "",
      getSatisfactionLabel(e.subjectiveSatisfaction),
      `"${(e.thinkAloudNotes ?? "").replace(/"/g, '""')}"`,
      e.startedAt?.toISOString() ?? "",
      e.completedAt?.toISOString() ?? "",
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
