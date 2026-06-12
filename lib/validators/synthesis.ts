import { z } from "zod";

export const updateSessionSynthesisSchema = z.object({
  recordingUrl: z
    .union([z.string().url("Introduce un enlace válido"), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value)),
  recordingNotes: z.string().max(10000).nullable().optional(),
});

export const createRecordingMarkerSchema = z.object({
  offsetSeconds: z.number().int().min(0).max(86400),
  label: z.string().min(1, "La etiqueta es obligatoria").max(200),
  notes: z.string().max(5000).nullable().optional(),
  executionId: z.string().uuid().nullable().optional(),
});

export const updateRecordingMarkerSchema = createRecordingMarkerSchema.partial();

export const createExecutionFindingSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  observation: z.string().min(1, "La observación es obligatoria").max(10000),
  recommendation: z.string().min(1, "La recomendación es obligatoria").max(10000),
  recordingOffsetSeconds: z.number().int().min(0).max(86400).nullable().optional(),
});

export const updateExecutionFindingSchema = createExecutionFindingSchema.partial();

export type UpdateSessionSynthesisValues = z.infer<typeof updateSessionSynthesisSchema>;
export type CreateRecordingMarkerValues = z.infer<typeof createRecordingMarkerSchema>;
export type UpdateRecordingMarkerValues = z.infer<typeof updateRecordingMarkerSchema>;
export type CreateExecutionFindingValues = z.infer<typeof createExecutionFindingSchema>;
export type UpdateExecutionFindingValues = z.infer<typeof updateExecutionFindingSchema>;
