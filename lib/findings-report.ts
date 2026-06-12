import { readEvidenceFile } from "@/lib/evidence-storage";
import { formatSeconds } from "@/lib/executive-report";
import { SITE_AUTHOR } from "@/lib/site-author";
import { getSessionForSynthesis } from "@/lib/synthesis.server";
import { mapSessionToSynthesis } from "@/lib/synthesis";
import { formatOffsetSeconds } from "@/lib/time-format";

export type FindingsReportFinding = {
  title: string;
  observation: string;
  recommendation: string;
  recordingOffsetFormatted: string | null;
  screenshotDataUrl: string | null;
};

export type FindingsReportExecution = {
  situationLabel: string;
  resultLabel: string;
  timeOnTaskFormatted: string;
  findings: FindingsReportFinding[];
};

export type FindingsReport = {
  projectName: string;
  participantCode: string;
  generatedAt: string;
  completedAt: string | null;
  recordingUrl: string | null;
  recordingNotes: string | null;
  markers: Array<{
    offsetFormatted: string;
    label: string;
    notes: string | null;
    situationLabel: string | null;
  }>;
  executions: FindingsReportExecution[];
  authorName: string;
};

async function toDataUrl(relativePath: string | null): Promise<string | null> {
  if (!relativePath) return null;
  try {
    const buffer = await readEvidenceFile(relativePath);
    const ext = relativePath.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function buildFindingsReport(sessionId: string): Promise<FindingsReport | null> {
  const session = await getSessionForSynthesis(sessionId);
  if (!session) return null;

  const synthesis = mapSessionToSynthesis(session);

  const executions: FindingsReportExecution[] = [];

  for (const execution of synthesis.executions) {
    if (execution.findings.length === 0) continue;

    const findings: FindingsReportFinding[] = [];
    for (const finding of execution.findings) {
      findings.push({
        title: finding.title,
        observation: finding.observation,
        recommendation: finding.recommendation,
        recordingOffsetFormatted: finding.recordingOffsetFormatted,
        screenshotDataUrl: await toDataUrl(finding.screenshotPath),
      });
    }

    executions.push({
      situationLabel: execution.situationLabel,
      resultLabel: execution.resultLabel,
      timeOnTaskFormatted: execution.timeOnTaskFormatted,
      findings,
    });
  }

  return {
    projectName: synthesis.projectName,
    participantCode: synthesis.participantCode,
    generatedAt: new Date().toISOString(),
    completedAt: synthesis.completedAt,
    recordingUrl: synthesis.recordingUrl,
    recordingNotes: synthesis.recordingNotes,
    markers: synthesis.recordingMarkers.map((marker) => ({
      offsetFormatted: formatOffsetSeconds(marker.offsetSeconds),
      label: marker.label,
      notes: marker.notes,
      situationLabel: marker.situationLabel,
    })),
    executions,
    authorName: SITE_AUTHOR.name,
  };
}

export { formatSeconds, formatOffsetSeconds };
