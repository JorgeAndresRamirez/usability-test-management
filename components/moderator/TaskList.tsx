"use client";

import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModeratorTask } from "@/lib/types/moderator";

type TaskListProps = {
  tasks: ModeratorTask[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
  onReorder: (taskId: string, direction: "up" | "down") => void;
  onDelete: (taskId: string) => void;
};

export function TaskList({
  tasks,
  selectedTaskId,
  onSelect,
  onReorder,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-slate-500">
          Aún no hay situaciones configuradas. Crea la primera con el formulario.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <Card
          key={task.id}
          className={`border-slate-200/80 shadow-sm transition-colors ${
            selectedTaskId === task.id ? "border-indigo-400 ring-1 ring-indigo-400/30" : ""
          }`}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-base">
                Situación {task.orderIndex + 1}
              </CardTitle>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {task.scenarioNarrative}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="muted">{task.maxTimeMinutes} min máx.</Badge>
              {task.askSatisfaction && (
                <Badge variant="info">Satisfacción</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSelect(task.id)}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={index === 0}
              onClick={() => onReorder(task.id, "up")}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={index === tasks.length - 1}
              onClick={() => onReorder(task.id, "down")}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
