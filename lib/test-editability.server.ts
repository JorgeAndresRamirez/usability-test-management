import { prisma } from "@/lib/prisma";

import {
  type TestEditabilityCounts,
  isTestConfigurationEditable,
} from "@/lib/test-editability";

export { isTestConfigurationEditable, type TestEditabilityCounts };
export { TEST_CONFIG_LOCKED_MESSAGE } from "@/lib/test-editability";

export async function getTestEditabilityCounts(
  testId: string,
): Promise<TestEditabilityCounts> {
  const [participantCount, executionCount] = await Promise.all([
    prisma.participant.count({ where: { testId } }),
    prisma.taskExecution.count({
      where: { session: { testId } },
    }),
  ]);

  return { participantCount, executionCount };
}
