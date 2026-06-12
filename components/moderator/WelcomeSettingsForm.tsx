"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { WelcomeScreen } from "@/components/participant/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TEST_CONFIG_LOCKED_MESSAGE } from "@/lib/test-editability";
import {
  DEFAULT_WELCOME_INSTRUCTIONS,
  DEFAULT_WELCOME_TITLE,
} from "@/lib/welcome-defaults";

const welcomeSettingsSchema = z.object({
  welcomeEnabled: z.boolean(),
  welcomeTitle: z.string().min(1, "El título es obligatorio"),
  welcomeInstructions: z
    .string()
    .min(10, "Escribe al menos una indicación para el participante"),
});

type WelcomeSettingsValues = z.infer<typeof welcomeSettingsSchema>;

type WelcomeSettingsFormProps = {
  testId: string;
  editable: boolean;
  initialEnabled: boolean;
  initialTitle: string;
  initialInstructions: string;
};

export function WelcomeSettingsForm({
  testId,
  editable,
  initialEnabled,
  initialTitle,
  initialInstructions,
}: WelcomeSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WelcomeSettingsValues>({
    resolver: zodResolver(welcomeSettingsSchema),
    defaultValues: {
      welcomeEnabled: initialEnabled,
      welcomeTitle: initialTitle || DEFAULT_WELCOME_TITLE,
      welcomeInstructions: initialInstructions || DEFAULT_WELCOME_INSTRUCTIONS,
    },
  });

  const welcomeEnabled = watch("welcomeEnabled");
  const welcomeTitle = watch("welcomeTitle");
  const welcomeInstructions = watch("welcomeInstructions");

  const onSubmit = async (values: WelcomeSettingsValues) => {
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

      toast.success("Pantalla de bienvenida actualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const restoreDefaults = () => {
    setValue("welcomeTitle", DEFAULT_WELCOME_TITLE);
    setValue("welcomeInstructions", DEFAULT_WELCOME_INSTRUCTIONS);
  };

  return (
    <Card className="mb-8 border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Pantalla de bienvenida</CardTitle>
        {!editable ? (
          <p className="text-sm text-amber-700">{TEST_CONFIG_LOCKED_MESSAGE}</p>
        ) : (
          <p className="text-sm text-slate-500">
            Indicaciones que verá el participante antes del primer escenario (cámara, Think Aloud,
            etc.).
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-slate-300"
                checked={welcomeEnabled}
                disabled={!editable}
                onChange={(event) => setValue("welcomeEnabled", event.target.checked)}
              />
              <div>
                <span className="font-medium text-slate-900">Mostrar bienvenida</span>
                <p className="text-xs text-slate-500">
                  Si está desactivada, se muestra el primer escenario al iniciar la sesión.
                </p>
              </div>
            </label>

            <div className="space-y-2">
              <Label htmlFor="welcomeTitle">Título</Label>
              <Input
                id="welcomeTitle"
                {...register("welcomeTitle")}
                disabled={!editable || !welcomeEnabled}
              />
              {errors.welcomeTitle && (
                <p className="text-xs text-red-600">{errors.welcomeTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeInstructions">Indicaciones</Label>
              <Textarea
                id="welcomeInstructions"
                rows={8}
                {...register("welcomeInstructions")}
                disabled={!editable || !welcomeEnabled}
                placeholder="Una indicación por párrafo. Ej.: Activa tu cámara…"
              />
              {errors.welcomeInstructions && (
                <p className="text-xs text-red-600">{errors.welcomeInstructions.message}</p>
              )}
              <p className="text-xs text-slate-400">
                Cada párrafo se muestra como un punto en la pantalla del participante.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={!editable || isSaving}>
                Guardar bienvenida
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={restoreDefaults}
                disabled={!editable || !welcomeEnabled}
              >
                Restaurar texto sugerido
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              Vista previa participante
            </p>
            <WelcomeScreen
              title={welcomeEnabled ? welcomeTitle : "Bienvenida desactivada"}
              instructions={welcomeEnabled ? welcomeInstructions : ""}
              preview
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
