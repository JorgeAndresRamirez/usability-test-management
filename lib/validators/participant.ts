import { z } from "zod";

export const createParticipantSchema = z.object({
  code: z
    .string()
    .min(2, "El código es obligatorio")
    .max(10, "Máximo 10 caracteres")
    .regex(/^[A-Za-z0-9]+$/, "Solo letras y números"),
  notes: z.string().optional(),
});

export type CreateParticipantValues = z.infer<typeof createParticipantSchema>;
