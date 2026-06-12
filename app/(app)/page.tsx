import { ArrowRight, BarChart3, ClipboardList, Users } from "lucide-react";
import Link from "next/link";

import { CreateTestDialog } from "@/components/moderator/CreateTestDialog";
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
        eyebrow="Módulo 1"
        title="Proyectos de investigación"
        description="Crea y gestiona tests de usabilidad. Registra participantes según criterios de relación usuario-sistema."
        actions={<CreateTestDialog />}
      />

      {tests.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50">
              <ClipboardList className="size-5 text-indigo-600" />
            </div>
            <p className="mt-4 font-medium text-slate-900">Sin proyectos todavía</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Crea tu primer test de usabilidad o ejecuta{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run db:seed</code>{" "}
              para cargar datos de ejemplo.
            </p>
            <div className="mt-6">
              <CreateTestDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => {
            const participantCount = test._count.participants;
            const nielsenWarning = participantCount < 5 || participantCount > 15;

            return (
              <Card
                key={test.id}
                className="group border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        {test.projectName}
                      </h2>
                      <TestStatusBadge status={test.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="size-3.5" />
                        {test._count.tasks} situaciones
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {participantCount} participantes
                      </span>
                      {test.startDate && (
                        <span>
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
                      <p className="text-xs text-amber-600">
                        Se recomienda entre 5 y 15 participantes (curva de Nielsen)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/tests/${test.id}`}
                        className={buttonVariants({
                          className: "bg-indigo-600 text-white hover:bg-indigo-700",
                        })}
                      >
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
