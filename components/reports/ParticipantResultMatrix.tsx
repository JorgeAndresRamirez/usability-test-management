"use client";

import type { TaskResult } from "@/lib/generated/prisma/client";
import type { ParticipantResultMatrix } from "@/lib/analytics";
import { getResultLabel } from "@/lib/execution-rules";
import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ParticipantResultMatrixProps = {
  matrix: ParticipantResultMatrix;
};

const RESULT_STYLES: Record<
  TaskResult,
  { bg: string; text: string; symbol: string }
> = {
  SUCCESS: { bg: "bg-green-100", text: "text-green-800", symbol: "✓" },
  NON_CRITICAL_ERROR: { bg: "bg-amber-100", text: "text-amber-800", symbol: "!" },
  CRITICAL_ERROR: { bg: "bg-red-100", text: "text-red-800", symbol: "✗" },
};

function MatrixCell({
  result,
  helpRequested,
  isFalseCompletion,
  situationLabel,
  participantCode,
}: {
  result: TaskResult | null;
  helpRequested: boolean;
  isFalseCompletion: boolean;
  situationLabel: string;
  participantCode: string;
}) {
  if (!result) {
    return (
      <td className="p-1 text-center">
        <span className="inline-flex size-9 items-center justify-center rounded-md bg-slate-50 text-xs text-slate-300">
          —
        </span>
      </td>
    );
  }

  const style = RESULT_STYLES[result];
  const flags = [
    helpRequested ? "Ayuda" : null,
    isFalseCompletion ? "Falsa fin." : null,
  ].filter(Boolean);
  const title = [
    `${participantCode} · ${situationLabel}`,
    getResultLabel(result),
    ...flags,
  ].join(" · ");

  return (
    <td className="p-1 text-center">
      <span
        title={title}
        className={cn(
          "relative inline-flex size-9 cursor-default items-center justify-center rounded-md text-sm font-bold",
          style.bg,
          style.text,
        )}
      >
        {style.symbol}
        {flags.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-white" />
        )}
      </span>
    </td>
  );
}

export function ParticipantResultMatrixView({ matrix }: ParticipantResultMatrixProps) {
  if (matrix.rows.length === 0) return null;

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Mapa de resultados por participante</CardTitle>
        <p className="text-sm text-slate-500">
          Cada celda muestra el resultado en una situación. El punto indica ayuda o falsa
          finalización. Pasa el cursor para ver el detalle.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex size-5 items-center justify-center rounded bg-green-100 font-bold text-green-800">
              ✓
            </span>
            Éxito
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex size-5 items-center justify-center rounded bg-amber-100 font-bold text-amber-800">
              !
            </span>
            Error no crítico
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex size-5 items-center justify-center rounded bg-red-100 font-bold text-red-800">
              ✗
            </span>
            Error crítico
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Ayuda o falsa finalización
          </span>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Participante
                </th>
                {matrix.situations.map((situation) => (
                  <th
                    key={situation.taskId}
                    className="p-2 text-center text-xs font-medium text-slate-500"
                  >
                    {situation.label}
                  </th>
                ))}
                <th className="p-2 text-center text-xs font-medium text-slate-500">Éxito</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.sessionId} className="border-t border-slate-100">
                  <td className="sticky left-0 z-10 bg-white p-2">
                    <div className="flex items-center gap-2">
                      <ParticipantAvatar code={row.participantCode} size="sm" />
                      <span className="font-medium text-slate-900">{row.participantCode}</span>
                    </div>
                  </td>
                  {row.cells.map((cell) => (
                    <MatrixCell
                      key={`${row.sessionId}-${cell.taskId}`}
                      result={cell.result}
                      helpRequested={cell.helpRequested}
                      isFalseCompletion={cell.isFalseCompletion}
                      situationLabel={cell.situationLabel}
                      participantCode={row.participantCode}
                    />
                  ))}
                  <td className="p-2 text-center text-sm font-semibold text-slate-700">
                    {row.metrics.successRate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </CardContent>
    </Card>
  );
}
