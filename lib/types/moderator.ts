import type { TaskResult, SessionStatus, TestStatus } from "@/lib/generated/prisma/client";

export type ModeratorTask = {
  id: string;
  testId: string;
  orderIndex: number;
  startPoint: string;
  goalDescription: string;
  successCriterion: string;
  maxTimeMinutes: number;
  scenarioNarrative: string;
  askSatisfaction: boolean;
};

export type ModeratorTest = {
  id: string;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  prototypeUrl: string | null;
  userProfileCriteria: string;
  presentationToken: string;
  status: TestStatus;
  tasks: ModeratorTask[];
};

export type ModeratorSession = {
  id: string;
  testId: string;
  participantId: string;
  participantCode: string;
  currentTaskIndex: number;
  status: SessionStatus;
  startedAt: string | null;
  completedAt: string | null;
  presentationToken: string;
};

export type ModeratorExecution = {
  id: string;
  sessionId: string;
  taskId: string;
  result: TaskResult | null;
  taskCompleted: boolean | null;
  timeOnTaskSeconds: number | null;
  subjectiveSatisfaction: number | null;
  nonCriticalErrorCount: number;
  nonCriticalSeverity: "MILD" | "SEVERE" | null;
  isFalseCompletion: boolean;
  helpRequested: boolean;
  thinkAloudNotes: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export { TaskResult, SessionStatus, TestStatus };
