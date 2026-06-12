import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  testTransferBundleSchema,
  type TestTransferBundle,
} from "@/lib/validators/test-transfer";

export const TEST_TRANSFER_FORMAT = "moderated-usability-test" as const;
export const TEST_TRANSFER_VERSION = 1 as const;

export function slugifyFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function buildTestTransferBundle(
  prisma: PrismaClient,
  testId: string,
): Promise<TestTransferBundle> {
  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      tasks: { orderBy: { orderIndex: "asc" } },
      participants: {
        orderBy: { orderIndex: "asc" },
        include: {
          sessions: {
            include: {
              executions: {
                include: { task: { select: { orderIndex: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!test) {
    throw new Error("TEST_NOT_FOUND");
  }

  return {
    format: TEST_TRANSFER_FORMAT,
    version: TEST_TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    sourceTestId: test.id,
    test: {
      projectName: test.projectName,
      startDate: test.startDate?.toISOString() ?? null,
      endDate: test.endDate?.toISOString() ?? null,
      prototypeUrl: test.prototypeUrl,
      userProfileCriteria: test.userProfileCriteria,
      status: test.status,
      welcomeEnabled: test.welcomeEnabled,
      welcomeTitle: test.welcomeTitle,
      welcomeInstructions: test.welcomeInstructions,
      tasks: test.tasks.map((task) => ({
        orderIndex: task.orderIndex,
        startPoint: task.startPoint,
        goalDescription: task.goalDescription,
        successCriterion: task.successCriterion,
        maxTimeMinutes: task.maxTimeMinutes,
        scenarioNarrative: task.scenarioNarrative,
        askSatisfaction: task.askSatisfaction,
      })),
      participants: test.participants.map((participant) => {
        const session = participant.sessions[0] ?? null;
        return {
          code: participant.code,
          orderIndex: participant.orderIndex,
          notes: participant.notes,
          session: session
            ? {
                status: session.status,
                currentTaskIndex: session.currentTaskIndex,
                startedAt: session.startedAt?.toISOString() ?? null,
                completedAt: session.completedAt?.toISOString() ?? null,
                executions: session.executions.map((execution) => ({
                  taskOrderIndex: execution.task.orderIndex,
                  result: execution.result,
                  taskCompleted: execution.taskCompleted,
                  timeOnTaskSeconds: execution.timeOnTaskSeconds,
                  subjectiveSatisfaction: execution.subjectiveSatisfaction,
                  nonCriticalErrorCount: execution.nonCriticalErrorCount,
                  nonCriticalSeverity: execution.nonCriticalSeverity,
                  isFalseCompletion: execution.isFalseCompletion,
                  helpRequested: execution.helpRequested,
                  thinkAloudNotes: execution.thinkAloudNotes,
                  startedAt: execution.startedAt?.toISOString() ?? null,
                  completedAt: execution.completedAt?.toISOString() ?? null,
                })),
              }
            : null,
        };
      }),
    },
  };
}

export function parseTestTransferBundle(data: unknown): TestTransferBundle {
  return testTransferBundleSchema.parse(data);
}

export async function importTestTransferBundle(
  prisma: PrismaClient,
  bundle: TestTransferBundle,
) {
  const { test: payload } = bundle;

  return prisma.$transaction(async (tx) => {
    const created = await tx.usabilityTest.create({
      data: {
        projectName: payload.projectName,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        prototypeUrl: payload.prototypeUrl,
        userProfileCriteria: payload.userProfileCriteria,
        status: payload.status,
        welcomeEnabled: payload.welcomeEnabled,
        welcomeTitle: payload.welcomeTitle,
        welcomeInstructions: payload.welcomeInstructions,
        tasks: {
          create: payload.tasks.map((task) => ({
            orderIndex: task.orderIndex,
            startPoint: task.startPoint,
            goalDescription: task.goalDescription,
            successCriterion: task.successCriterion,
            maxTimeMinutes: task.maxTimeMinutes,
            scenarioNarrative: task.scenarioNarrative,
            askSatisfaction: task.askSatisfaction,
          })),
        },
      },
      include: {
        tasks: { orderBy: { orderIndex: "asc" } },
      },
    });

    const taskIdByOrderIndex = new Map(
      created.tasks.map((task) => [task.orderIndex, task.id]),
    );

    for (const participant of payload.participants) {
      const createdParticipant = await tx.participant.create({
        data: {
          testId: created.id,
          code: participant.code,
          orderIndex: participant.orderIndex,
          notes: participant.notes,
        },
      });

      const sessionPayload = participant.session;
      if (!sessionPayload) continue;

      const session = await tx.testSession.create({
        data: {
          testId: created.id,
          participantId: createdParticipant.id,
          status: sessionPayload.status,
          currentTaskIndex: sessionPayload.currentTaskIndex,
          startedAt: sessionPayload.startedAt ? new Date(sessionPayload.startedAt) : null,
          completedAt: sessionPayload.completedAt
            ? new Date(sessionPayload.completedAt)
            : null,
        },
      });

      for (const execution of sessionPayload.executions) {
        const taskId = taskIdByOrderIndex.get(execution.taskOrderIndex);
        if (!taskId) continue;

        await tx.taskExecution.create({
          data: {
            sessionId: session.id,
            taskId,
            result: execution.result,
            taskCompleted: execution.taskCompleted,
            timeOnTaskSeconds: execution.timeOnTaskSeconds,
            subjectiveSatisfaction: execution.subjectiveSatisfaction,
            nonCriticalErrorCount: execution.nonCriticalErrorCount,
            nonCriticalSeverity: execution.nonCriticalSeverity,
            isFalseCompletion: execution.isFalseCompletion,
            helpRequested: execution.helpRequested,
            thinkAloudNotes: execution.thinkAloudNotes,
            startedAt: execution.startedAt ? new Date(execution.startedAt) : null,
            completedAt: execution.completedAt ? new Date(execution.completedAt) : null,
          },
        });
      }
    }

    return created;
  });
}
