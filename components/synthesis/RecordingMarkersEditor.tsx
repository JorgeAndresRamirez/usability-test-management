"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SessionSynthesisData, SynthesisMarker } from "@/lib/synthesis";
import { parseOffsetInput } from "@/lib/time-format";

type RecordingMarkersEditorProps = {
  sessionId: string;
  markers: SynthesisMarker[];
  executions: SessionSynthesisData["executions"];
  onChange: (markers: SynthesisMarker[]) => void;
};

const emptyDraft = {
  offsetInput: "",
  label: "",
  notes: "",
  executionId: "",
};

export function RecordingMarkersEditor({
  sessionId,
  markers,
  executions,
  onChange,
}: RecordingMarkersEditorProps) {
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    const offsetSeconds = parseOffsetInput(draft.offsetInput);
    if (offsetSeconds === null) {
      toast.error("Introduce un tiempo válido (mm:ss o segundos)");
      return;
    }
    if (!draft.label.trim()) {
      toast.error("La etiqueta es obligatoria");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/recording-markers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offsetSeconds,
          label: draft.label.trim(),
          notes: draft.notes.trim() || null,
          executionId: draft.executionId || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo crear el marcador");

      onChange([...markers, data.marker]);
      setDraft(emptyDraft);
      toast.success("Marcador añadido");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (markerId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/recording-markers/${markerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "No se pudo eliminar");
      }
      onChange(markers.filter((marker) => marker.id !== markerId));
      toast.success("Marcador eliminado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      {markers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay marcadores. Añade momentos clave mientras revisas la grabación.
        </p>
      ) : (
        <div className="space-y-2">
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-card/80 px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                    {marker.offsetFormatted}
                  </span>
                  <span className="font-medium text-foreground">{marker.label}</span>
                  {marker.situationLabel && (
                    <span className="text-xs text-muted-foreground">{marker.situationLabel}</span>
                  )}
                </div>
                {marker.notes && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{marker.notes}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(marker.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed border-border/80 bg-secondary/20 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Nuevo marcador</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="marker-offset">Momento (mm:ss)</Label>
            <Input
              id="marker-offset"
              placeholder="02:34"
              value={draft.offsetInput}
              onChange={(event) => setDraft((prev) => ({ ...prev, offsetInput: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marker-label">Etiqueta</Label>
            <Input
              id="marker-label"
              placeholder="Confusión en el botón principal"
              value={draft.label}
              onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="marker-situation">Situación (opcional)</Label>
            <select
              id="marker-situation"
              value={draft.executionId || "none"}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  executionId: event.target.value === "none" ? "" : event.target.value,
                }))
              }
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="none">Sin vincular</option>
              {executions.map((execution) => (
                <option key={execution.executionId} value={execution.executionId}>
                  {execution.situationLabel}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="marker-notes">Notas (opcional)</Label>
            <Textarea
              id="marker-notes"
              rows={2}
              value={draft.notes}
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
        </div>
        <Button type="button" className="mt-3" disabled={isSaving} onClick={handleAdd}>
          <Plus className="size-4" />
          Añadir marcador
        </Button>
      </div>
    </div>
  );
}
