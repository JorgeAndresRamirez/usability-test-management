import type { SessionStatus, TestStatus } from "@/lib/generated/prisma/client";

export const TEST_STATUS_LABELS: Record<TestStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  ARCHIVED: "Archivado",
};

export const TEST_STATUS_DESCRIPTIONS: Record<TestStatus, string> = {
  DRAFT:
    "Estás configurando situaciones, participantes y la pantalla de bienvenida. Aún no estás ejecutando sesiones.",
  ACTIVE:
    "El proyecto está en curso: puedes ejecutar sesiones con participantes y recopilar observaciones.",
  COMPLETED:
    "Las pruebas terminaron. Revisa reportes y exporta el informe ejecutivo.",
  ARCHIVED:
    "Proyecto cerrado y guardado como referencia histórica. No se esperan más sesiones.",
};

export const TEST_STATUS_BADGE_CLASS: Record<TestStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  COMPLETED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  ARCHIVED: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
};

export const SESSION_STATUS_BADGE_CLASS: Record<SessionStatus, string> = {
  PENDING: "border-slate-200 bg-slate-50 text-slate-600",
  IN_PROGRESS: "border-sky-200 bg-sky-50 text-sky-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export const TEST_STATUS_ORDER: TestStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
];
