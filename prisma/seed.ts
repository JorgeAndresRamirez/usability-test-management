import "dotenv/config";

import { deriveTaskCompleted } from "../lib/execution-rules";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.taskExecution.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.task.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.usabilityTest.deleteMany();

  const test = await prisma.usabilityTest.create({
    data: {
      projectName: "Portal Estudiantil SICAU — Piloto",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-30"),
      prototypeUrl: "https://figma.com/proto/ejemplo",
      userProfileCriteria:
        "Estudiantes activos del programa que hayan usado al menos una vez el portal académico en el último semestre. Relación usuario-sistema: usuarios frecuentes con experiencia básica en trámites en línea.",
      status: "ACTIVE",
      participants: {
        create: [
          {
            code: "P01",
            orderIndex: 0,
            notes: "Usuario frecuente del portal, realiza consulta de notas semanalmente.",
          },
        ],
      },
      tasks: {
        create: [
          {
            orderIndex: 0,
            startPoint: "Pantalla de inicio de sesión del portal",
            goalDescription: "Consultar el estado de una solicitud de certificado",
            successCriterion:
              "El participante visualiza el detalle de la solicitud con estado actualizado",
            maxTimeMinutes: 5,
            askSatisfaction: true,
            scenarioNarrative:
              "Imagina que solicitaste un certificado de notas hace unos días y quieres saber si ya está listo. Entra al portal y averigua en qué estado se encuentra tu solicitud.",
          },
          {
            orderIndex: 1,
            startPoint: "Panel principal tras iniciar sesión",
            goalDescription: "Actualizar el correo de contacto del perfil",
            successCriterion:
              "El participante guarda un nuevo correo y ve confirmación del cambio",
            maxTimeMinutes: 4,
            askSatisfaction: false,
            scenarioNarrative:
              "Has cambiado de correo personal y necesitas que las notificaciones del sistema lleguen a tu nueva dirección. Actualiza tu información de contacto en el portal.",
          },
          {
            orderIndex: 2,
            startPoint: "Sección de trámites en línea",
            goalDescription: "Descargar un comprobante de matrícula",
            successCriterion:
              "El participante descarga o visualiza el comprobante en PDF",
            maxTimeMinutes: 6,
            askSatisfaction: true,
            scenarioNarrative:
              "Tu entidad financiera te pidió un comprobante de matrícula del semestre actual. Busca en el portal cómo obtener ese documento.",
          },
        ],
      },
    },
    include: {
      participants: true,
    },
  });

  const session = await prisma.testSession.create({
    data: {
      testId: test.id,
      participantId: test.participants[0].id,
      status: "COMPLETED",
      currentTaskIndex: 3,
      startedAt: new Date("2026-06-10T10:00:00"),
      completedAt: new Date("2026-06-10T10:45:00"),
    },
  });

  const tasks = await prisma.task.findMany({
    where: { testId: test.id },
    orderBy: { orderIndex: "asc" },
  });

  const sampleResults = [
    {
      result: "SUCCESS" as const,
      tot: 142,
      sat: 4,
      helpRequested: false,
      nonCriticalErrorCount: 0,
      nonCriticalSeverity: null,
      isFalseCompletion: false,
    },
    {
      result: "NON_CRITICAL_ERROR" as const,
      tot: 198,
      sat: 3,
      helpRequested: true,
      nonCriticalErrorCount: 2,
      nonCriticalSeverity: "MILD" as const,
      isFalseCompletion: false,
    },
    {
      result: "CRITICAL_ERROR" as const,
      tot: 310,
      sat: 2,
      helpRequested: false,
      nonCriticalErrorCount: 0,
      nonCriticalSeverity: null,
      isFalseCompletion: true,
    },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const sample = sampleResults[i];
    await prisma.taskExecution.create({
      data: {
        sessionId: session.id,
        taskId: tasks[i].id,
        result: sample.result,
        taskCompleted: deriveTaskCompleted(sample.result),
        timeOnTaskSeconds: sample.tot,
        subjectiveSatisfaction: tasks[i].askSatisfaction ? sample.sat : null,
        nonCriticalErrorCount: sample.nonCriticalErrorCount,
        nonCriticalSeverity: sample.nonCriticalSeverity,
        isFalseCompletion: sample.isFalseCompletion,
        helpRequested: sample.helpRequested,
        thinkAloudNotes: "Notas de ejemplo del think aloud para la situación.",
        startedAt: new Date(`2026-06-10T10:${10 + i * 10}:00`),
        completedAt: new Date(`2026-06-10T10:${12 + i * 10}:00`),
      },
    });
  }

  console.log("Seed completado:");
  console.log(`- Test: ${test.projectName} (${test.id})`);
  console.log(`- Token presentación: ${test.presentationToken}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
