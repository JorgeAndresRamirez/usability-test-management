import { z } from "zod";

export const createExecutionSchema = z
  .object({
    taskId: z.string().uuid(),
    result: z.enum(["SUCCESS", "NON_CRITICAL_ERROR", "CRITICAL_ERROR"]),
    timeOnTaskSeconds: z.number().int().min(0),
    subjectiveSatisfaction: z.number().int().min(1).max(4).nullable().optional(),
    thinkAloudNotes: z.string().optional(),
    nonCriticalErrorCount: z.number().int().min(0).default(0),
    nonCriticalSeverity: z.enum(["MILD", "SEVERE"]).optional().nullable(),
    isFalseCompletion: z.boolean().default(false),
    helpRequested: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.result === "NON_CRITICAL_ERROR" && data.nonCriticalErrorCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registra al menos 1 error no crítico",
        path: ["nonCriticalErrorCount"],
      });
    }

    if (data.result !== "NON_CRITICAL_ERROR" && data.nonCriticalErrorCount > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El contador de errores solo aplica a errores no críticos",
        path: ["nonCriticalErrorCount"],
      });
    }

    if (data.result !== "NON_CRITICAL_ERROR" && data.nonCriticalSeverity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La gravedad solo aplica a errores no críticos",
        path: ["nonCriticalSeverity"],
      });
    }

    if (data.result !== "CRITICAL_ERROR" && data.isFalseCompletion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Falsa finalización solo aplica a errores críticos",
        path: ["isFalseCompletion"],
      });
    }
  });

export type CreateExecutionInput = z.infer<typeof createExecutionSchema>;

export const updateExecutionNotesSchema = z.object({
  thinkAloudNotes: z.string(),
});

export const updateSessionSchema = z.object({
  currentTaskIndex: z.number().int().min(-1).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  startTask: z.boolean().optional(),
  startFirstSituation: z.boolean().optional(),
  advanceTask: z.boolean().optional(),
});
