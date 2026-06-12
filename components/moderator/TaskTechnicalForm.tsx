"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TaskFormValues } from "@/lib/validators/task";

type TaskTechnicalFormProps = {
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
};

export function TaskTechnicalForm({ register, errors }: TaskTechnicalFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Ficha Técnica</h3>
        <Badge variant="info">Solo moderador</Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startPoint">Punto de partida</Label>
        <Textarea
          id="startPoint"
          rows={3}
          placeholder="Ej. Pantalla de inicio de sesión"
          {...register("startPoint")}
        />
        {errors.startPoint && (
          <p className="text-sm text-red-600">{errors.startPoint.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalDescription">Descripción de la meta</Label>
        <Textarea
          id="goalDescription"
          rows={3}
          placeholder="Ej. El participante debe recuperar su contraseña"
          {...register("goalDescription")}
        />
        {errors.goalDescription && (
          <p className="text-sm text-red-600">{errors.goalDescription.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="successCriterion">Criterio de éxito (hito final)</Label>
        <Textarea
          id="successCriterion"
          rows={3}
          placeholder="Ej. Visualiza el mensaje de confirmación"
          {...register("successCriterion")}
        />
        {errors.successCriterion && (
          <p className="text-sm text-red-600">{errors.successCriterion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTimeMinutes">Tiempo máximo (minutos)</Label>
        <Input
          id="maxTimeMinutes"
          type="number"
          min={1}
          max={120}
          {...register("maxTimeMinutes", { valueAsNumber: true })}
        />
        {errors.maxTimeMinutes && (
          <p className="text-sm text-red-600">{errors.maxTimeMinutes.message}</p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300"
          {...register("askSatisfaction")}
        />
        <div>
          <span className="font-medium text-slate-900">Preguntar satisfacción</span>
          <p className="text-xs text-slate-500">
            Si está activo, el moderador registrará la escala 1–4 al cerrar esta situación. Puedes
            activarlo solo en los escenarios donde te interese medir satisfacción.
          </p>
        </div>
      </label>
    </div>
  );
}
