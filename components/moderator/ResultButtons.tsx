"use client";

import { Button } from "@/components/ui/button";
import type { TaskResult } from "@/lib/types/moderator";

type ResultButtonsProps = {
  value: TaskResult | null;
  onChange: (result: TaskResult) => void;
  disabled?: boolean;
};

const options: Array<{
  value: TaskResult;
  label: string;
  description: string;
  className: string;
}> = [
  {
    value: "SUCCESS",
    label: "Éxito",
    description: "Completó la meta correctamente",
    className: "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
  },
  {
    value: "NON_CRITICAL_ERROR",
    label: "Error No Crítico",
    description: "Dudó pero se recuperó",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  {
    value: "CRITICAL_ERROR",
    label: "Error Crítico",
    description: "Abandonó o falsa finalización",
    className: "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
  },
];

export function ResultButtons({ value, onChange, disabled }: ResultButtonsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Resultado de la situación</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`h-auto justify-start px-4 py-3 text-left ${
              value === option.value
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
  );
}
