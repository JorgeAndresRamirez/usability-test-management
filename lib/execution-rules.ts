import type { TaskResult } from "@/lib/generated/prisma/client";

export const RESULT_LABELS: Record<TaskResult, string> = {
  SUCCESS: "Éxito",
  NON_CRITICAL_ERROR: "Error no crítico",
  CRITICAL_ERROR: "Error crítico",
};

export function getResultLabel(result: TaskResult | null | undefined): string {
  if (!result) return "—";
  return RESULT_LABELS[result] ?? result;
}

export function deriveTaskCompleted(result: TaskResult): boolean {
  switch (result) {
    case "SUCCESS":
    case "NON_CRITICAL_ERROR":
      return true;
    case "CRITICAL_ERROR":
      return false;
  }
}

export const SATISFACTION_LABELS: Record<number, string> = {
  1: "Nada satisfecho",
  2: "Poco satisfecho",
  3: "Satisfecho",
  4: "Muy satisfecho",
};

export function getSatisfactionLabel(value: number | null): string {
  if (value === null) return "";
  return SATISFACTION_LABELS[value] ?? String(value);
}

export const NON_CRITICAL_SEVERITY_LABELS: Record<string, string> = {
  MILD: "Leve",
  SEVERE: "Grave",
};

export function getNonCriticalSeverityLabel(
  severity: string | null | undefined,
): string {
  if (!severity) return "";
  return NON_CRITICAL_SEVERITY_LABELS[severity] ?? severity;
}
