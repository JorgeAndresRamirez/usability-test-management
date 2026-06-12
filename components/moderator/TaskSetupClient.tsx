"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { TestNav } from "@/components/layout/TestNav";
import { TaskList } from "@/components/moderator/TaskList";
import { TaskScenarioForm } from "@/components/moderator/TaskScenarioForm";
import { TaskTechnicalForm } from "@/components/moderator/TaskTechnicalForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ModeratorTask } from "@/lib/types/moderator";
import { taskFormSchema, type TaskFormValues } from "@/lib/validators/task";

type TaskSetupClientProps = {
  testId: string;
  projectName: string;
  presentationToken: string;
  initialTasks: ModeratorTask[];
  sessionId: string | null;
};

const emptyValues: TaskFormValues = {
  startPoint: "",
  goalDescription: "",
  successCriterion: "",
  maxTimeMinutes: 5,
  scenarioNarrative: "",
  askSatisfaction: false,
};

export function TaskSetupClient({
  testId,
  projectName,
  presentationToken,
  initialTasks,
  sessionId,
}: TaskSetupClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const presentationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${presentationToken}${
          sessionId ? `?sessionId=${sessionId}` : ""
        }`
      : `/p/${presentationToken}`;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyValues,
  });

  const loadTask = (task: ModeratorTask) => {
    setSelectedTaskId(task.id);
    reset({
      startPoint: task.startPoint,
      goalDescription: task.goalDescription,
      successCriterion: task.successCriterion,
      maxTimeMinutes: task.maxTimeMinutes,
      scenarioNarrative: task.scenarioNarrative,
      askSatisfaction: task.askSatisfaction,
    });
  };

  const refreshTasks = async () => {
    const response = await fetch(`/api/tests/${testId}/tasks`);
    if (!response.ok) {
      throw new Error("No se pudieron cargar las situaciones");
    }
    const data = await response.json();
    setTasks(data);
    router.refresh();
  };

  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const url = selectedTaskId
        ? `/api/tests/${testId}/tasks/${selectedTaskId}`
        : `/api/tests/${testId}/tasks`;
      const method = selectedTaskId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la situación");
      }

      await refreshTasks();
      reset(emptyValues);
      setSelectedTaskId(null);
      toast.success(selectedTaskId ? "Situación actualizada" : "Situación creada");
    } catch {
      toast.error("Error al guardar la situación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorder = async (taskId: string, direction: "up" | "down") => {
    try {
      const response = await fetch(`/api/tests/${testId}/tasks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, direction }),
      });

      if (!response.ok) {
        throw new Error("No se pudo reordenar");
      }

      await refreshTasks();
    } catch {
      toast.error("Error al reordenar la situación");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("¿Eliminar esta situación?")) return;

    try {
      const response = await fetch(`/api/tests/${testId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error");

      if (selectedTaskId === taskId) {
        reset(emptyValues);
        setSelectedTaskId(null);
      }
      await refreshTasks();
      toast.success("Situación eliminada");
    } catch {
      toast.error("Error al eliminar la situación");
    }
  };

  const copyPresentationLink = async () => {
    await navigator.clipboard.writeText(presentationUrl);
    toast.success("Enlace de presentación copiado");
  };

  return (
    <>
      <TestNav testId={testId} sessionId={sessionId} />
      <PageHeader
        eyebrow="Módulo 2"
        title={projectName}
        description="Define fichas técnicas privadas y escenarios narrativos para el participante."
        actions={
          <>
            {sessionId && (
              <Link
                href={`/tests/${testId}/sessions/${sessionId}/run`}
                className={buttonVariants({
                  className: "bg-indigo-600 text-white hover:bg-indigo-700",
                })}
              >
                Ir al panel de ejecución
              </Link>
            )}
            <Button variant="outline" onClick={copyPresentationLink}>
              <Copy className="size-4" />
              Copiar enlace
            </Button>
            <Link
              href={presentationUrl}
              target="_blank"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink className="size-4" />
              Vista participante
            </Link>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Situaciones</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTaskId(null);
                reset(emptyValues);
              }}
            >
              <Plus className="size-4" />
              Nueva
            </Button>
          </div>
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelect={(taskId) => {
              const task = tasks.find((item) => item.id === taskId);
              if (task) loadTask(task);
            }}
            onReorder={handleReorder}
            onDelete={handleDelete}
          />
        </div>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>
              {selectedTask ? `Editar situación ${selectedTask.orderIndex + 1}` : "Nueva situación"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-8 xl:grid-cols-2">
                <TaskTechnicalForm register={register} errors={errors} />
                <TaskScenarioForm
                  register={register}
                  errors={errors}
                  watch={watch}
                  situationNumber={
                    selectedTask ? selectedTask.orderIndex + 1 : tasks.length + 1
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedTaskId(null);
                    reset(emptyValues);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {selectedTaskId ? "Guardar cambios" : "Crear situación"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
