import { z } from "zod";

const taskTransferSchema = z.object({
  orderIndex: z.number().int().min(0),
  startPoint: z.string().min(1),
  goalDescription: z.string().min(1),
  successCriterion: z.string().min(1),
  maxTimeMinutes: z.number().int().min(1).max(120),
  scenarioNarrative: z.string().min(1),
  askSatisfaction: z.boolean(),
});

const executionTransferSchema = z.object({
  taskOrderIndex: z.number().int().min(0),
  result: z.enum(["SUCCESS", "NON_CRITICAL_ERROR", "CRITICAL_ERROR"]).nullable(),
  taskCompleted: z.boolean().nullable(),
  timeOnTaskSeconds: z.number().int().nullable(),
  subjectiveSatisfaction: z.number().int().min(1).max(4).nullable(),
  nonCriticalErrorCount: z.number().int().min(0),
  nonCriticalSeverity: z.enum(["MILD", "SEVERE"]).nullable(),
  isFalseCompletion: z.boolean(),
  helpRequested: z.boolean(),
  thinkAloudNotes: z.string().nullable(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
});

const sessionTransferSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  currentTaskIndex: z.number().int(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  executions: z.array(executionTransferSchema),
});

const participantTransferSchema = z.object({
  code: z.string().min(1),
  orderIndex: z.number().int().min(0),
  notes: z.string().nullable(),
  session: sessionTransferSchema.nullable(),
});

export const testTransferBundleSchema = z.object({
  format: z.literal("moderated-usability-test"),
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  sourceTestId: z.string().uuid().optional(),
  test: z.object({
    projectName: z.string().min(2),
    startDate: z.string().datetime().nullable(),
    endDate: z.string().datetime().nullable(),
    prototypeUrl: z.string().nullable(),
    userProfileCriteria: z.string().min(10),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
    welcomeEnabled: z.boolean(),
    welcomeTitle: z.string().min(1),
    welcomeInstructions: z.string().min(1),
    tasks: z.array(taskTransferSchema).min(0),
    participants: z.array(participantTransferSchema).min(0),
  }),
});

export type TestTransferBundle = z.infer<typeof testTransferBundleSchema>;
