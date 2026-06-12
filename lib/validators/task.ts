import { z } from "zod";

export const taskTechnicalSchema = z.object({
  startPoint: z.string().min(1, "El punto de partida es obligatorio"),
  goalDescription: z.string().min(1, "La descripción de la meta es obligatoria"),
  successCriterion: z.string().min(1, "El criterio de éxito es obligatorio"),
  maxTimeMinutes: z
    .number()
    .int()
    .min(1, "El tiempo máximo debe ser al menos 1 minuto")
    .max(120, "El tiempo máximo no puede superar 120 minutos"),
  askSatisfaction: z.boolean(),
});

export const taskScenarioSchema = z.object({
  scenarioNarrative: z
    .string()
    .min(10, "El escenario narrativo debe tener al menos 10 caracteres"),
});

export const taskFormSchema = taskTechnicalSchema.merge(taskScenarioSchema);

export type TaskFormValues = z.infer<typeof taskFormSchema>;
