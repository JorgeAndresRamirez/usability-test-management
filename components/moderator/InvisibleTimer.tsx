"use client";

import { useEffect } from "react";

import { formatDuration } from "@/lib/format";
import { useTimer } from "@/lib/hooks/useTimer";

type InvisibleTimerProps = {
  maxMinutes: number;
  isActive: boolean;
  onSecondsChange?: (seconds: number) => void;
  resetKey?: string;
};

export function InvisibleTimer({
  maxMinutes,
  isActive,
  onSecondsChange,
  resetKey,
}: InvisibleTimerProps) {
  const { seconds, isRunning, start, stop, reset } = useTimer();
  const isOverMax = seconds > maxMinutes * 60;

  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  useEffect(() => {
    if (isActive && !isRunning) {
      start();
      return;
    }

    if (!isActive && isRunning) {
      stop();
    }
  }, [isActive, isRunning, start, stop]);

  useEffect(() => {
    onSecondsChange?.(seconds);
  }, [seconds, onSecondsChange]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Time on Task (solo moderador)
      </p>
      <span className="mt-2 block text-3xl font-mono tabular-nums text-slate-900">
        {formatDuration(seconds)}
      </span>
      {isOverMax && (
        <p className="mt-2 text-sm text-amber-600">Tiempo máximo superado</p>
      )}
    </div>
  );
}
