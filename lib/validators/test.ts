import { z } from "zod";

export const createTestSchema = z.object({
  projectName: z.string().min(2, "El nombre del proyecto es obligatorio"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prototypeUrl: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "URL inválida",
    }),
  userProfileCriteria: z
    .string()
    .min(10, "Describe los criterios de elegibilidad usuario-sistema"),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  welcomeEnabled: z.boolean().optional(),
  welcomeTitle: z.string().min(1, "El título es obligatorio").optional(),
  welcomeInstructions: z
    .string()
    .min(10, "Escribe las indicaciones para el participante")
    .optional(),
});

export type CreateTestValues = z.infer<typeof createTestSchema>;

export const projectMetadataSchema = createTestSchema.pick({
  projectName: true,
  startDate: true,
  endDate: true,
  prototypeUrl: true,
  userProfileCriteria: true,
});

export type ProjectMetadataValues = z.infer<typeof projectMetadataSchema>;

export const updateTestSchema = createTestSchema.partial();

export type UpdateTestValues = z.infer<typeof updateTestSchema>;
