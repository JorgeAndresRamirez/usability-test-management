import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExecutiveReport } from "@/lib/executive-report";
import { formatSeconds } from "@/lib/executive-report";

export function ScenarioDetailTable({ report }: { report: ExecutiveReport }) {
  return (
    <Card className="mt-8 border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Detalle por situación</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Situación</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Finalización</TableHead>
              <TableHead>Éxito</TableHead>
              <TableHead>ToT</TableHead>
              <TableHead>Err. NC (cant.)</TableHead>
              <TableHead>Falsa fin.</TableHead>
              <TableHead>Ayuda</TableHead>
              <TableHead>Satisf.</TableHead>
              <TableHead>n</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.taskDetails.map((task) => (
              <TableRow key={task.taskId}>
                <TableCell className="font-medium">{task.label}</TableCell>
                <TableCell className="max-w-xs truncate text-slate-500">
                  {task.goalDescription}
                </TableCell>
                <TableCell>{task.completionRate.toFixed(0)}%</TableCell>
                <TableCell>{task.successRate.toFixed(0)}%</TableCell>
                <TableCell>
                  <span className={task.exceedsMaxTime ? "text-amber-600" : ""}>
                    {formatSeconds(task.avgTimeOnTaskSeconds)}
                  </span>
                </TableCell>
                <TableCell>
                  {task.avgNonCriticalErrorCount > 0
                    ? task.avgNonCriticalErrorCount.toFixed(1)
                    : "—"}
                </TableCell>
                <TableCell>{task.falseCompletionCount || "—"}</TableCell>
                <TableCell>{task.helpRequestedCount || "—"}</TableCell>
                <TableCell>{task.avgSatisfaction.toFixed(1)}</TableCell>
                <TableCell>{task.totalExecutions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
