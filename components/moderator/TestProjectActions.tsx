"use client";

import { Copy, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

type TestProjectActionsProps = {
  testId: string;
  projectName: string;
  variant?: "default" | "compact";
};

export function TestProjectActions({
  testId,
  projectName,
  variant = "default",
}: TestProjectActionsProps) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const response = await fetch(`/api/tests/${testId}/clone`, { method: "POST" });
      if (!response.ok) throw new Error("Error");

      const clone = await response.json();
      toast.success("Proyecto clonado como borrador");
      router.push(`/tests/${clone.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo clonar el proyecto");
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(
      `¿Eliminar el proyecto «${projectName}»?\n\nSe borrarán participantes, sesiones, situaciones y todos los resultados. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error");

      toast.success("Proyecto eliminado");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el proyecto");
    } finally {
      setIsDeleting(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleClone}
          disabled={isCloning || isDeleting}
        >
          <Copy className="size-3.5" />
          Clonar
        </Button>
        <a
          href={`/api/tests/${testId}/export`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          download
        >
          <Download className="size-3.5" />
          Exportar
        </a>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={handleDelete}
          disabled={isCloning || isDeleting}
        >
          <Trash2 className="size-3.5" />
          Eliminar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClone}
        disabled={isCloning || isDeleting}
      >
        <Copy className="size-4" />
        Clonar proyecto
      </Button>
      <a
        href={`/api/tests/${testId}/export`}
        className={buttonVariants({ variant: "outline" })}
        download
      >
        <Download className="size-4" />
        Exportar proyecto
      </a>
      <Button
        type="button"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        onClick={handleDelete}
        disabled={isCloning || isDeleting}
      >
        <Trash2 className="size-4" />
        Eliminar proyecto
      </Button>
    </div>
  );
}
