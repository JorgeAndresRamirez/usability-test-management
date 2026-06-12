import type { Task, TestSession, UsabilityTest } from "@/lib/generated/prisma/client";
import type { ModeratorSession, ModeratorTask } from "@/lib/types/moderator";
import type {
  ParticipantPresentation,
  ParticipantScenario,
} from "@/lib/types/participant";
import { toSituationLabel } from "@/lib/format";

export function mapTaskToModerator(task: Task): ModeratorTask {
  return {
    id: task.id,
    testId: task.testId,
    orderIndex: task.orderIndex,
    startPoint: task.startPoint,
    goalDescription: task.goalDescription,
    successCriterion: task.successCriterion,
    maxTimeMinutes: task.maxTimeMinutes,
    scenarioNarrative: task.scenarioNarrative,
    askSatisfaction: task.askSatisfaction,
  };
}

export function mapTaskToParticipantScenario(task: Task): ParticipantScenario {
  return {
    situationLabel: toSituationLabel(task.orderIndex),
    narrative: task.scenarioNarrative,
  };
}

export function mapSessionToModerator(
  session: TestSession & {
    participant: { code: string };
    test: { presentationToken: string };
  },
): ModeratorSession {
  return {
    id: session.id,
    testId: session.testId,
    participantId: session.participantId,
    participantCode: session.participant.code,
    currentTaskIndex: session.currentTaskIndex,
    status: session.status,
    startedAt: session.startedAt?.toISOString() ?? null,
    completedAt: session.completedAt?.toISOString() ?? null,
    presentationToken: session.test.presentationToken,
  };
}

export function buildParticipantPresentation(
  test: UsabilityTest & { tasks: Task[] },
  session: TestSession | null,
): ParticipantPresentation {
  const sortedTasks = [...test.tasks].sort((a, b) => a.orderIndex - b.orderIndex);

  const welcomePhase =
    test.welcomeEnabled &&
    session?.status === "IN_PROGRESS" &&
    session.currentTaskIndex === -1;

  const currentTask =
    session && session.currentTaskIndex >= 0
      ? sortedTasks.find((task) => task.orderIndex === session.currentTaskIndex)
      : null;

  return {
    welcome: welcomePhase
      ? { title: test.welcomeTitle, instructions: test.welcomeInstructions }
      : null,
    currentSituation:
      welcomePhase || !currentTask ? null : mapTaskToParticipantScenario(currentTask),
    totalSituations: sortedTasks.length,
    sessionStatus: session?.status ?? "PENDING",
  };
}
