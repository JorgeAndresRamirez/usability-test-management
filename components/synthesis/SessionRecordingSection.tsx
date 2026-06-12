"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SessionRecordingSectionProps = {
  sessionId: string;
  recordingUrl: string | null;
  recordingNotes: string | null;
  onChange: (values: { recordingUrl: string | null; recordingNotes: string | null }) => void;
};

export function SessionRecordingSection({
  sessionId,
  recordingUrl,
  recordingNotes,
  onChange,
}: SessionRecordingSectionProps) {
  const [url, setUrl] = useState(recordingUrl ?? "");
  const [notes, setNotes] = useState(recordingNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/synthesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingUrl: url.trim() || null,
          recordingNotes: notes.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo guardar");

      onChange({
        recordingUrl: data.recordingUrl,
        recordingNotes: data.recordingNotes,
      });
      toast.success("Registro audiovisual guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recording-url">Enlace a la grabación</Label>
        <Input
          id="recording-url"
          type="url"
          placeholder="https://loom.com/share/..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Pega el enlace de Loom, Zoom, Drive u otra plataforma donde esté alojada la sesión.
        </p>
      </div>

      {url.trim() && (
        <a
          href={url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          Abrir grabación
        </a>
      )}

      <div className="space-y-2">
        <Label htmlFor="recording-notes">Notas generales de revisión</Label>
        <Textarea
          id="recording-notes"
          rows={4}
          placeholder="Impresiones generales tras revisar la grabación completa..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <Button type="button" disabled={isSaving} onClick={handleSave}>
        Guardar registro
      </Button>
    </div>
  );
}
