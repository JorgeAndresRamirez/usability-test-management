"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { TaskResult } from "@/lib/types/moderator";

export type ExecutionOutcome = {
  result: TaskResult | null;
  nonCriticalErrorCount: number;
  nonCriticalSeverity: "MILD" | "SEVERE" | null;
  isFalseCompletion: boolean;
  helpRequested: boolean | null;
};

type ExecutionOutcomeFormProps = {
  value: ExecutionOutcome;
  onChange: (value: ExecutionOutcome) => void;
  disabled?: boolean;
};

const resultOptions: Array<{
  value: TaskResult;
  label: string;
  description: string;
  className: string;
}> = [
  {
    value: "SUCCESS",
    label: "Éxito",
    description: "Completó la meta sin asistencia relevante",
    className: "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  },
  {
    value: "NON_CRITICAL_ERROR",
    label: "Error No Crítico",
    description: "Dudó o se desvió pero alcanzó la meta",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  {
    value: "CRITICAL_ERROR",
    label: "Error Crítico",
    description: "No completó la meta (abandono o fracaso)",
    className: "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
  },
];

export function ExecutionOutcomeForm({
  value,
  onChange,
  disabled,
}: ExecutionOutcomeFormProps) {
  const setResult = (result: TaskResult) => {
    onChange({
      result,
      nonCriticalErrorCount: result === "NON_CRITICAL_ERROR" ? Math.max(1, value.nonCriticalErrorCount) : 0,
      nonCriticalSeverity: result === "NON_CRITICAL_ERROR" ? value.nonCriticalSeverity : null,
      isFalseCompletion: result === "CRITICAL_ERROR" ? value.isFalseCompletion : false,
      helpRequested: value.helpRequested,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Resultado de la situación</p>
        <div className="grid gap-3">
          {resultOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => setResult(option.value)}
              className={`h-auto justify-start px-4 py-3 text-left ${
                value.result === option.value
                  ? `${option.className} ring-2 ring-offset-2`
                  : ""
              }`}
            >
              <span>
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-xs font-normal opacity-80">
                  {option.description}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </div>

      {value.result === "NON_CRITICAL_ERROR" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-4">
          <div className="space-y-2">
            <Label>Cantidad de errores no críticos</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || value.nonCriticalErrorCount <= 1}
                onClick={() =>
                  onChange({
                    ...value,
                    nonCriticalErrorCount: Math.max(1, value.nonCriticalErrorCount - 1),
                  })
                }
              >
                <Minus className="size-4" />
              </Button>
              <span className="min-w-8 text-center text-lg font-semibold tabular-nums">
                {value.nonCriticalErrorCount}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  onChange({
                    ...value,
                    nonCriticalErrorCount: value.nonCriticalErrorCount + 1,
                  })
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gravedad del error (opcional)</Label>
            <RadioGroup
              value={value.nonCriticalSeverity ?? ""}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  nonCriticalSeverity:
                    next === "MILD" || next === "SEVERE" ? next : null,
                })
              }
              className="flex gap-4"
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MILD" id="severity-mild" />
                <Label htmlFor="severity-mild" className="font-normal">
                  Leve
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="SEVERE" id="severity-severe" />
                <Label htmlFor="severity-severe" className="font-normal">
                  Grave
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {value.result === "CRITICAL_ERROR" && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-slate-300"
              checked={value.isFalseCompletion}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...value, isFalseCompletion: e.target.checked })
              }
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Falsa finalización
              </span>
              <span className="block text-xs text-slate-500">
                El usuario creyó tener éxito pero no alcanzó la meta
              </span>
            </span>
          </label>
        </div>
      )}

      {value.result && (
        <div className="space-y-2">
          <Label>Solicitó ayuda</Label>
          <RadioGroup
            value={
              value.helpRequested === null ? "" : value.helpRequested ? "yes" : "no"
            }
            onValueChange={(next) =>
              onChange({
                ...value,
                helpRequested: next === "yes",
              })
            }
            className="flex gap-4"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id="help-yes" />
              <Label htmlFor="help-yes" className="font-normal">
                Sí
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id="help-no" />
              <Label htmlFor="help-no" className="font-normal">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
