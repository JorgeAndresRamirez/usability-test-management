import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { ParticipantsManager } from "@/components/moderator/ParticipantsManager";
import { ProjectMetadataForm } from "@/components/moderator/ProjectMetadataForm";
import { TestStatusManager } from "@/components/moderator/TestStatusManager";
import { WelcomeSettingsForm } from "@/components/moderator/WelcomeSettingsForm";
import { buttonVariants } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { prisma } from "@/lib/prisma";
import {
  getTestEditabilityCounts,
  isTestConfigurationEditable,
} from "@/lib/test-editability.server";

function formatDateInput(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

type PageProps = {
  params: Promise<{ testId: string }>;
};

export default async function TestDetailPage({ params }: PageProps) {
  const { testId } = await params;

  const test = await prisma.usabilityTest.findUnique({
    where: { id: testId },
    include: {
      participants: {
        orderBy: { orderIndex: "asc" },
        include: { sessions: true },
      },
      sessions: { take: 1 },
      _count: { select: { tasks: true } },
    },
  });

  if (!test) notFound();

  const editabilityCounts = await getTestEditabilityCounts(testId);
  const configurationEditable = isTestConfigurationEditable(editabilityCounts);

  return (
    <>
      <TestNav testId={test.id} sessionId={test.sessions[0]?.id ?? null} />
      <PageHeader
        eyebrow="Módulo 1"
        title={test.projectName}
        description="Configura metadatos del proyecto y registra participantes elegibles."
        actions={
          <Link
            href={`/p/${test.presentationToken}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink className="size-4" />
            Vista participante
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <KpiCard label="Situaciones" value={test._count.tasks} />
        <KpiCard label="Participantes" value={test.participants.length} />
      </div>

      <TestStatusManager testId={test.id} initialStatus={test.status} />

      <ProjectMetadataForm
        testId={test.id}
        editable={configurationEditable}
        presentationToken={test.presentationToken}
        initialProjectName={test.projectName}
        initialStartDate={formatDateInput(test.startDate)}
        initialEndDate={formatDateInput(test.endDate)}
        initialPrototypeUrl={test.prototypeUrl ?? ""}
        initialUserProfileCriteria={test.userProfileCriteria}
      />

      <WelcomeSettingsForm
        testId={test.id}
        editable={configurationEditable}
        initialEnabled={test.welcomeEnabled}
        initialTitle={test.welcomeTitle}
        initialInstructions={test.welcomeInstructions}
      />

      <ParticipantsManager testId={test.id} initialParticipants={test.participants} />
    </>
  );
}
