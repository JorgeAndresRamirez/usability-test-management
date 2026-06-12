"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ImportTestDialog() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Selecciona un archivo .json exportado desde esta aplicación");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 5 MB");
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const response = await fetch("/api/tests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
        projectName?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo importar el proyecto");
      }

      toast.success(`Proyecto «${data?.projectName}» importado`);
      router.push(`/tests/${data?.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al importar");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handlePickFile}
        disabled={isImporting}
      >
        <Upload className="size-4" />
        {isImporting ? "Importando…" : "Importar proyecto"}
      </Button>
    </>
  );
}
