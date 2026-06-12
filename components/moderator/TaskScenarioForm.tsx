"use client";

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

import { ScenarioCard } from "@/components/participant/ScenarioCard";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TaskFormValues } from "@/lib/validators/task";

type TaskScenarioFormProps = {
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
  watch: UseFormWatch<TaskFormValues>;
  situationNumber: number;
};

export function TaskScenarioForm({
  register,
  errors,
  watch,
  situationNumber,
}: TaskScenarioFormProps) {
  const narrative = watch("scenarioNarrative");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Tarjeta-Escenario</h3>
        <p className="mt-1 text-sm text-slate-500">
          Redacta un escenario narrativo no dirigido. El participante nunca verá
          términos evaluativos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenarioNarrative">Escenario narrativo</Label>
        <Textarea
          id="scenarioNarrative"
          rows={8}
          placeholder="Imagina que necesitas consultar el estado de tu solicitud..."
          {...register("scenarioNarrative")}
        />
        {errors.scenarioNarrative && (
          <p className="text-sm text-red-600">{errors.scenarioNarrative.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-600">Vista previa del participante</p>
        <ScenarioCard
          situationNumber={situationNumber}
          narrative={narrative}
          preview
        />
      </div>
    </div>
  );
}
