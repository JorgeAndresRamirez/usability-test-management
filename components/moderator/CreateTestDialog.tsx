"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTestSchema, type CreateTestValues } from "@/lib/validators/test";

export function CreateTestDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTestValues>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      projectName: "",
      userProfileCriteria: "",
      prototypeUrl: "",
    },
  });

  const onSubmit = async (values: CreateTestValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Error al crear");

      const test = await response.json();
      toast.success("Proyecto creado");
      setOpen(false);
      reset();
      router.push(`/tests/${test.id}`);
      router.refresh();
    } catch {
      toast.error("No se pudo crear el proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="size-4" />
            Nuevo proyecto
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo test de usabilidad</DialogTitle>
          <DialogDescription>
            Define los metadatos del proyecto y los criterios de elegibilidad basados en la
            relación usuario-sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del proyecto</Label>
            <Input id="projectName" {...register("projectName")} />
            {errors.projectName && (
              <p className="text-sm text-red-600">{errors.projectName.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prototypeUrl">Enlace al prototipo</Label>
            <Input
              id="prototypeUrl"
              placeholder="https://figma.com/..."
              {...register("prototypeUrl")}
            />
            {errors.prototypeUrl && (
              <p className="text-sm text-red-600">{errors.prototypeUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="userProfileCriteria">Perfil de usuarios (usuario-sistema)</Label>
            <Textarea
              id="userProfileCriteria"
              rows={4}
              placeholder="Ej. Estudiantes activos que hayan usado el portal al menos una vez..."
              {...register("userProfileCriteria")}
            />
            {errors.userProfileCriteria && (
              <p className="text-sm text-red-600">{errors.userProfileCriteria.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              Crear proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
