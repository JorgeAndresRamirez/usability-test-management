"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ScreenshotUpload } from "@/components/synthesis/ScreenshotUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { SynthesisExecution, SynthesisFinding } from "@/lib/synthesis";
import { parseOffsetInput } from "@/lib/time-format";

type ExecutionFindingsEditorProps = {
  sessionId: string;
  execution: SynthesisExecution;
  onChange: (findings: SynthesisFinding[]) => void;
};

const emptyDraft = {
  title: "",
  observation: "",
  recommendation: "",
  offsetInput: "",
};

export function ExecutionFindingsEditor({
  sessionId,
  execution,
  onChange,
}: ExecutionFindingsEditorProps) {
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!draft.title.trim() || !draft.observation.trim() || !draft.recommendation.trim()) {
      toast.error("Completa título, observación y recomendación");
      return;
    }

    const recordingOffsetSeconds = draft.offsetInput.trim()
      ? parseOffsetInput(draft.offsetInput)
      : null;

    if (draft.offsetInput.trim() && recordingOffsetSeconds === null) {
      toast.error("Introduce un tiempo válido (mm:ss o segundos)");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/executions/${execution.executionId}/findings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title.trim(),
            observation: draft.observation.trim(),
            recommendation: draft.recommendation.trim(),
            recordingOffsetSeconds,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo crear el hallazgo");

      onChange([...execution.findings, data.finding]);
      setDraft(emptyDraft);
      toast.success("Hallazgo documentado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (findingId: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/executions/${execution.executionId}/findings/${findingId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "No se pudo eliminar");
      }
      onChange(execution.findings.filter((finding) => finding.id !== findingId));
      toast.success("Hallazgo eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  const updateFinding = (findingId: string, patch: Partial<SynthesisFinding>) => {
    onChange(
      execution.findings.map((finding) =>
        finding.id === findingId ? { ...finding, ...patch } : finding,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-secondary/30 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{execution.resultLabel}</Badge>
          <span className="text-sm text-muted-foreground">ToT: {execution.timeOnTaskFormatted}</span>
        </div>
        <RichTextContent
          html={execution.scenarioNarrative}
          variant="prose"
          className="text-sm text-muted-foreground"
        />
        {execution.thinkAloudNotes?.trim() && (
          <div className="mt-4 rounded-lg border border-border/60 bg-card/80 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Think aloud en vivo
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {execution.thinkAloudNotes}
            </p>
          </div>
        )}
      </div>

      {execution.findings.length > 0 && (
        <div className="space-y-4">
          {execution.findings.map((finding) => (
            <div
              key={finding.id}
              className="space-y-4 rounded-xl border border-border/70 bg-card/90 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{finding.title}</p>
                  {finding.recordingOffsetFormatted && (
                    <p className="mt-1 font-mono text-xs text-primary">
                      {finding.recordingOffsetFormatted} en la grabación
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(finding.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Observación
                </p>
                <p className="text-sm leading-relaxed text-foreground">{finding.observation}</p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-accent/40 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Recomendación
                </p>
                <p className="text-sm leading-relaxed text-foreground">{finding.recommendation}</p>
              </div>

              <ScreenshotUpload
                screenshotUrl={finding.screenshotUrl}
                originalName={finding.screenshotOriginalName}
                uploadUrl={`/api/sessions/${sessionId}/executions/${execution.executionId}/findings/${finding.id}/screenshot`}
                onUpdated={(screenshotUrl, originalName) =>
                  updateFinding(finding.id, {
                    screenshotUrl,
                    screenshotOriginalName: originalName,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="rounded-xl border border-dashed border-border/80 bg-secondary/20 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Nuevo hallazgo documentado</p>
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor={`finding-title-${execution.executionId}`}>Título breve</Label>
            <Input
              id={`finding-title-${execution.executionId}`}
              placeholder="Botón de confirmación ambiguo"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`finding-observation-${execution.executionId}`}>Observación</Label>
            <Textarea
              id={`finding-observation-${execution.executionId}`}
              rows={3}
              placeholder="Qué ocurrió y qué generó confusión..."
              value={draft.observation}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, observation: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`finding-recommendation-${execution.executionId}`}>
              Recomendación
            </Label>
            <Textarea
              id={`finding-recommendation-${execution.executionId}`}
              rows={3}
              placeholder="Qué debería cambiar el equipo de diseño o desarrollo..."
              value={draft.recommendation}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, recommendation: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`finding-offset-${execution.executionId}`}>
              Momento en grabación (opcional)
            </Label>
            <Input
              id={`finding-offset-${execution.executionId}`}
              placeholder="05:12"
              value={draft.offsetInput}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, offsetInput: event.target.value }))
              }
            />
          </div>
        </div>
        <Button type="button" className="mt-3" disabled={isSaving} onClick={handleAdd}>
          <Plus className="size-4" />
          Añadir hallazgo
        </Button>
      </div>
    </div>
  );
}
