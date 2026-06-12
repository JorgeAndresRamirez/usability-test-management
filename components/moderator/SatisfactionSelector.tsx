"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SATISFACTION_LABELS } from "@/lib/execution-rules";

type SatisfactionSelectorProps = {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const options = [1, 2, 3, 4] as const;

export function SatisfactionSelector({
  value,
  onChange,
  disabled,
}: SatisfactionSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Satisfacción</Label>
      <RadioGroup
        value={value === null ? "" : String(value)}
        onValueChange={(next) => {
          if (next) onChange(Number(next));
        }}
        className="grid gap-2"
        disabled={disabled}
      >
        {options.map((option) => (
          <div key={option} className="flex items-center gap-3">
            <RadioGroupItem
              value={option.toString()}
              id={`satisfaction-${option}`}
            />
            <Label htmlFor={`satisfaction-${option}`} className="font-normal">
              {option} — {SATISFACTION_LABELS[option]}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
