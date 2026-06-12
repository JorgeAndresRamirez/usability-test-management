"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Play, Trash2, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ParticipantAvatar } from "@/components/reports/ParticipantAvatar";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionStatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  createParticipantSchema,
  type CreateParticipantValues,
} from "@/lib/validators/participant";

type ParticipantRow = {
  id: string;
  code: string;
  notes: string | null;
  orderIndex: number;
  sessions: Array<{ id: string; status: string }>;
};

type ParticipantsManagerProps = {
  testId: string;
  initialParticipants: ParticipantRow[];
};

export function ParticipantsManager({
  testId,
  initialParticipants,
}: ParticipantsManagerProps) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateParticipantValues>({
    resolver: zodResolver(createParticipantSchema),
    defaultValues: { code: "", notes: "" },
  });

  const count = participants.length;
  const nielsenWarning =
    count < 5 || count > 15
      ? `Se recomienda entre 5 y 15 participantes (curva de Nielsen). Actualmente: ${count}.`
      : null;

  const refresh = async () => {
    const response = await fetch(`/api/tests/${testId}/participants`);
    const data = await response.json();
    setParticipants(data);
    router.refresh();
  };

  const onSubmit = async (values: CreateParticipantValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tests/${testId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Error");

      toast.success("Participante registrado");
      reset();
      await refresh();
    } catch {
      toast.error("No se pudo registrar el participante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (participantId: string) => {
    if (!confirm("¿Eliminar este participante y su sesión?")) return;

    await fetch(`/api/tests/${testId}/participants/${participantId}`, {
      method: "DELETE",
    });
    toast.success("Participante eliminado");
    await refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-primary" />
            Registrar participante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" placeholder="P01" {...register("code")} />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Relación usuario-sistema</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Ej. Usuario frecuente que reserva servicios en línea cada semana..."
                {...register("notes")}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Participantes ({count})</CardTitle>
          {nielsenWarning && (
            <p className="text-sm text-amber-600">{nielsenWarning}</p>
          )}
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aún no hay participantes registrados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Perfil usuario-sistema</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => {
                  const session = participant.sessions[0];
                  return (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ParticipantAvatar code={participant.code} size="sm" />
                          <span className="font-medium">{participant.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-slate-500">
                        <span className="line-clamp-2">{participant.notes || "—"}</span>
                      </TableCell>
                      <TableCell>
                        {session ? (
                          <SessionStatusBadge status={session.status} />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {session && (
                            <Link
                              href={`/tests/${testId}/sessions/${session.id}/run`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              <Play className="size-3.5" />
                              Ejecutar
                            </Link>
                          )}
                          {session?.status === "COMPLETED" && (
                            <>
                              <Link
                                href={`/tests/${testId}/sessions/${session.id}/synthesis`}
                                className={buttonVariants({ variant: "default", size: "sm" })}
                              >
                                Síntesis
                              </Link>
                              <Link
                                href={`/tests/${testId}/reports/sessions/${session.id}`}
                                className={buttonVariants({ variant: "outline", size: "sm" })}
                              >
                                <FileText className="size-3.5" />
                                Resultados
                              </Link>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(participant.id)}
                          >
                            <Trash2 className="size-3.5 text-slate-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
