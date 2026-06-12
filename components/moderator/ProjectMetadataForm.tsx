"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TEST_CONFIG_LOCKED_MESSAGE } from "@/lib/test-editability";
import {
  projectMetadataSchema,
  type ProjectMetadataValues,
} from "@/lib/validators/test";

type ProjectMetadataFormProps = {
  testId: string;
  editable: boolean;
  presentationToken: string;
  initialProjectName: string;
  initialStartDate: string;
  initialEndDate: string;
  initialPrototypeUrl: string;
  initialUserProfileCriteria: string;
};

export function ProjectMetadataForm({
  testId,
  editable,
  presentationToken,
  initialProjectName,
  initialStartDate,
  initialEndDate,
  initialPrototypeUrl,
  initialUserProfileCriteria,
}: ProjectMetadataFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectMetadataValues>({
    resolver: zodResolver(projectMetadataSchema),
    defaultValues: {
      projectName: initialProjectName,
      startDate: initialStartDate,
      endDate: initialEndDate,
      prototypeUrl: initialPrototypeUrl,
      userProfileCriteria: initialUserProfileCriteria,
    },
  });

  const onSubmit = async (values: ProjectMetadataValues) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "No se pudo guardar");
      }

      toast.success("Metadatos actualizados");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar los metadatos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-8 border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Metadatos del proyecto</CardTitle>
        {!editable && (
          <p className="text-sm text-amber-700">{TEST_CONFIG_LOCKED_MESSAGE}</p>
        )}
        {editable && (
          <p className="text-sm text-slate-500">
            Nombre, fechas, prototipo y criterios de elegibilidad. Solo editable antes de registrar
            participantes o respuestas.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {editable ? (
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
                {...register("userProfileCriteria")}
              />
              {errors.userProfileCriteria && (
                <p className="text-sm text-red-600">{errors.userProfileCriteria.message}</p>
              )}
            </div>

            <div>
              <p className="text-slate-400 text-sm">Token de presentación</p>
              <Badge variant="muted" className="mt-1 font-mono text-xs">
                {presentationToken.slice(0, 8)}…
              </Badge>
              <p className="mt-1 text-xs text-slate-400">
                El token no se puede editar; comparte el enlace «Vista participante».
              </p>
            </div>

            <Button type="submit" disabled={isSaving}>
              Guardar metadatos
            </Button>
          </form>
        ) : (
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-400">Perfil de usuarios</p>
              <p className="mt-1 leading-relaxed text-slate-700">{initialUserProfileCriteria}</p>
            </div>
            <div className="space-y-3">
              {(initialStartDate || initialEndDate) && (
                <div>
                  <p className="text-slate-400">Periodo</p>
                  <p className="mt-1 text-slate-700">
                    {[initialStartDate, initialEndDate].filter(Boolean).join(" — ")}
                  </p>
                </div>
              )}
              {initialPrototypeUrl && (
                <div>
                  <p className="text-slate-400">Prototipo</p>
                  <a
                    href={initialPrototypeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-indigo-600 hover:underline"
                  >
                    {initialPrototypeUrl}
                  </a>
                </div>
              )}
              <div>
                <p className="text-slate-400">Token de presentación</p>
                <Badge variant="muted" className="mt-1 font-mono text-xs">
                  {presentationToken.slice(0, 8)}…
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
