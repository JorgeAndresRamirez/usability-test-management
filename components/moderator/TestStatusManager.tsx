"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { TestStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestStatus } from "@/lib/generated/prisma/client";
import {
  TEST_STATUS_DESCRIPTIONS,
  TEST_STATUS_LABELS,
  TEST_STATUS_ORDER,
} from "@/lib/status-badges";
import { cn } from "@/lib/utils";

type TestStatusManagerProps = {
  testId: string;
  initialStatus: TestStatus;
};

export function TestStatusManager({ testId, initialStatus }: TestStatusManagerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TestStatus>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (next: TestStatus) => {
    if (next === status) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) throw new Error("Error");

      setStatus(next);
      router.refresh();
      toast.success(`Estado actualizado a «${TEST_STATUS_LABELS[next]}»`);
    } catch {
      toast.error("No se pudo cambiar el estado");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-8 border-slate-200/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-base">Estado del proyecto</CardTitle>
          <TestStatusBadge status={status} />
        </div>
        <p className="text-sm text-slate-500">{TEST_STATUS_DESCRIPTIONS[status]}</p>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
          Cambiar estado
        </p>
        <div className="flex flex-wrap gap-2">
          {TEST_STATUS_ORDER.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={status === option ? "default" : "outline"}
              className={cn(
                status === option && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              disabled={isSaving}
              onClick={() => handleChange(option)}
            >
              {TEST_STATUS_LABELS[option]}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Flujo sugerido: <strong className="font-medium text-slate-500">Borrador</strong> mientras
          configuras → <strong className="font-medium text-slate-500">Activo</strong> al ejecutar
          pruebas → <strong className="font-medium text-slate-500">Completado</strong> al terminar
          → <strong className="font-medium text-slate-500">Archivado</strong> para cerrar el
          proyecto.
        </p>
      </CardContent>
    </Card>
  );
}
