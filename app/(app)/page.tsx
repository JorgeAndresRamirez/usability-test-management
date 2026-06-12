import { ArrowRight, BarChart3, ClipboardList, Users } from "lucide-react";
import Link from "next/link";

import { CreateTestDialog } from "@/components/moderator/CreateTestDialog";
import { ImportTestDialog } from "@/components/moderator/ImportTestDialog";
import { TestProjectActions } from "@/components/moderator/TestProjectActions";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestStatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const tests = await prisma.usabilityTest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { participants: true, tasks: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Investigación"
        title="Proyectos de usabilidad"
        description="Planifica sesiones moderadas, registra participantes y documenta hallazgos con criterios metodológicos claros."
        actions={
          <div className="flex flex-wrap gap-2">
            <ImportTestDialog />
            <CreateTestDialog />
          </div>
        }
      />

      {tests.length === 0 ? (
        <Card className="animate-fade-up border-dashed border-border bg-card/80 shadow-sm">
          <CardContent className="flex flex-col items-center py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
              <ClipboardList className="size-6" />
            </div>
            <p className="font-display mt-6 text-xl font-medium text-foreground">
              Aún no hay proyectos
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Crea tu primer test de usabilidad o ejecuta{" "}
              <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs">
                npm run db:seed
              </code>{" "}
              para cargar datos de ejemplo.
            </p>
            <div className="mt-8">
              <CreateTestDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test, index) => {
            const participantCount = test._count.participants;
            const nielsenWarning = participantCount < 5 || participantCount > 15;

            return (
              <Card
                key={test.id}
                className="animate-fade-up group relative overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 bg-primary/70 opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <CardContent className="flex flex-col gap-6 p-6 pl-7 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
                        {test.projectName}
                      </h2>
                      <TestStatusBadge status={test.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="size-3.5 text-primary/70" />
                        {test._count.tasks} situaciones
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary/70" />
                        {participantCount} participantes
                      </span>
                      {test.startDate && (
                        <span className="tabular-nums">
                          {test.startDate.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {test.endDate &&
                            ` — ${test.endDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`}
                        </span>
                      )}
                    </div>
                    {nielsenWarning && (
                      <p className="text-xs text-amber-700">
                        Se recomienda entre 5 y 15 participantes (curva de Nielsen)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/tests/${test.id}`} className={buttonVariants()}>
                        Gestionar
                        <ArrowRight className="size-4" />
                      </Link>
                      <Link
                        href={`/tests/${test.id}/reports`}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        <BarChart3 className="size-4" />
                        Reportes
                      </Link>
                    </div>
                    <TestProjectActions
                      testId={test.id}
                      projectName={test.projectName}
                      variant="compact"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
