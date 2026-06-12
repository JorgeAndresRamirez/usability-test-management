"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ScreenshotUploadProps = {
  screenshotUrl: string | null;
  originalName: string | null;
  uploadUrl: string;
  onUpdated: (screenshotUrl: string | null, originalName: string | null) => void;
  disabled?: boolean;
};

export function ScreenshotUpload({
  screenshotUrl,
  originalName,
  uploadUrl,
  onUpdated,
  disabled = false,
}: ScreenshotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo subir la captura");
      }

      onUpdated(data.finding.screenshotUrl, data.finding.screenshotOriginalName);
      toast.success("Captura guardada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al subir la captura");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!screenshotUrl || disabled) return;

    setIsUploading(true);
    try {
      const response = await fetch(uploadUrl, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo eliminar la captura");
      }

      onUpdated(null, null);
      toast.success("Captura eliminada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la captura");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />

      {screenshotUrl ? (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-secondary/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt={originalName ?? "Captura de pantalla del hallazgo"}
            className="max-h-64 w-full object-contain bg-white"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2">
            <p className="truncate text-xs text-muted-foreground">{originalName ?? "Captura"}</p>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={isUploading || disabled}
                onClick={() => inputRef.current?.click()}
              >
                Reemplazar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={isUploading || disabled}
                onClick={handleRemove}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading || disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent/40 hover:text-foreground disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          Subir captura de pantalla
        </button>
      )}
    </div>
  );
}
