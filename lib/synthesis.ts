import {
  getResultLabel,
} from "@/lib/execution-rules";
import { formatSeconds } from "@/lib/executive-report";
import { formatOffsetSeconds } from "@/lib/time-format";

export type SynthesisFinding = {
  id: string;
  executionId: string;
  orderIndex: number;
  title: string;
  observation: string;
  recommendation: string;
  screenshotPath: string | null;
  screenshotOriginalName: string | null;
  screenshotUrl: string | null;
  recordingOffsetSeconds: number | null;
  recordingOffsetFormatted: string | null;
};

export type SynthesisMarker = {
  id: string;
  sessionId: string;
  executionId: string | null;
  orderIndex: number;
  offsetSeconds: number;
  offsetFormatted: string;
  label: string;
  notes: string | null;
  situationLabel: string | null;
};

export type SynthesisExecution = {
  executionId: string;
  situationNumber: number;
  situationLabel: string;
  scenarioNarrative: string;
  result: string | null;
  resultLabel: string;
  timeOnTaskFormatted: string;
  thinkAloudNotes: string | null;
  findings: SynthesisFinding[];
};

export type SessionSynthesisData = {
  sessionId: string;
  testId: string;
  projectName: string;
  participantCode: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  recordingUrl: string | null;
  recordingNotes: string | null;
  recordingMarkers: SynthesisMarker[];
  executions: SynthesisExecution[];
  stats: {
    findingsCount: number;
    markersCount: number;
    hasRecording: boolean;
  };
};

type SessionWithRelations = Awaited<
  ReturnType<typeof import("@/lib/synthesis.server").getSessionForSynthesis>
>;

export function mapSessionToSynthesis(session: NonNullable<SessionWithRelations>): SessionSynthesisData {
  const executions: SynthesisExecution[] = session.executions
    .filter((execution) => execution.result !== null)
    .map((execution) => ({
      executionId: execution.id,
      situationNumber: execution.task.orderIndex + 1,
      situationLabel: `Situación ${execution.task.orderIndex + 1}`,
      scenarioNarrative: execution.task.scenarioNarrative,
      result: execution.result,
      resultLabel: execution.result ? getResultLabel(execution.result) : "—",
      timeOnTaskFormatted: formatSeconds(execution.timeOnTaskSeconds ?? 0),
      thinkAloudNotes: execution.thinkAloudNotes,
      findings: execution.findings.map((finding) => ({
        id: finding.id,
        executionId: finding.executionId,
        orderIndex: finding.orderIndex,
        title: finding.title,
        observation: finding.observation,
        recommendation: finding.recommendation,
        screenshotPath: finding.screenshotPath,
        screenshotOriginalName: finding.screenshotOriginalName,
        screenshotUrl: finding.screenshotPath
          ? `/api/evidence/${finding.screenshotPath}`
          : null,
        recordingOffsetSeconds: finding.recordingOffsetSeconds,
        recordingOffsetFormatted:
          finding.recordingOffsetSeconds !== null
            ? formatOffsetSeconds(finding.recordingOffsetSeconds)
            : null,
      })),
    }));

  const recordingMarkers: SynthesisMarker[] = session.recordingMarkers.map((marker) => ({
    id: marker.id,
    sessionId: marker.sessionId,
    executionId: marker.executionId,
    orderIndex: marker.orderIndex,
    offsetSeconds: marker.offsetSeconds,
    offsetFormatted: formatOffsetSeconds(marker.offsetSeconds),
    label: marker.label,
    notes: marker.notes,
    situationLabel: marker.execution
      ? `Situación ${marker.execution.task.orderIndex + 1}`
      : null,
  }));

  const findingsCount = executions.reduce((sum, item) => sum + item.findings.length, 0);

  return {
    sessionId: session.id,
    testId: session.testId,
    projectName: session.test.projectName,
    participantCode: session.participant.code,
    status: session.status,
    startedAt: session.startedAt?.toISOString() ?? null,
    completedAt: session.completedAt?.toISOString() ?? null,
    recordingUrl: session.recordingUrl,
    recordingNotes: session.recordingNotes,
    recordingMarkers,
    executions,
    stats: {
      findingsCount,
      markersCount: recordingMarkers.length,
      hasRecording: Boolean(session.recordingUrl),
    },
  };
}

export function mapFindingRecord(
  finding: {
    id: string;
    executionId: string;
    orderIndex: number;
    title: string;
    observation: string;
    recommendation: string;
    screenshotPath: string | null;
    screenshotOriginalName: string | null;
    recordingOffsetSeconds: number | null;
  },
): SynthesisFinding {
  return {
    id: finding.id,
    executionId: finding.executionId,
    orderIndex: finding.orderIndex,
    title: finding.title,
    observation: finding.observation,
    recommendation: finding.recommendation,
    screenshotPath: finding.screenshotPath,
    screenshotOriginalName: finding.screenshotOriginalName,
    screenshotUrl: finding.screenshotPath ? `/api/evidence/${finding.screenshotPath}` : null,
    recordingOffsetSeconds: finding.recordingOffsetSeconds,
    recordingOffsetFormatted:
      finding.recordingOffsetSeconds !== null
        ? formatOffsetSeconds(finding.recordingOffsetSeconds)
        : null,
  };
}

export function mapMarkerRecord(
  marker: {
    id: string;
    sessionId: string;
    executionId: string | null;
    orderIndex: number;
    offsetSeconds: number;
    label: string;
    notes: string | null;
    execution?: { task: { orderIndex: number } } | null;
  },
): SynthesisMarker {
  return {
    id: marker.id,
    sessionId: marker.sessionId,
    executionId: marker.executionId,
    orderIndex: marker.orderIndex,
    offsetSeconds: marker.offsetSeconds,
    offsetFormatted: formatOffsetSeconds(marker.offsetSeconds),
    label: marker.label,
    notes: marker.notes,
    situationLabel: marker.execution
      ? `Situación ${marker.execution.task.orderIndex + 1}`
      : null,
  };
}
