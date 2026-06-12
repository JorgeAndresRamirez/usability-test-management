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
      projectName: "Plataforma de reservas en línea — Piloto",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-30"),
      prototypeUrl: "https://figma.com/proto/ejemplo",
      userProfileCriteria:
        "Personas que reservan servicios en línea al menos una vez al mes. Relación usuario-sistema: usuarios habituales con experiencia básica en formularios y pagos digitales.",
      status: "ACTIVE",
      welcomeEnabled: true,
      welcomeTitle: "Bienvenido a la sesión",
      welcomeInstructions:
        "<p>Gracias por participar. Te mostraremos algunas situaciones cotidianas sobre una plataforma de reservas.</p><p>Piensa en voz alta mientras navegas: lo que buscas, lo que esperas y lo que te resulta confuso.</p><p>No hay respuestas correctas o incorrectas.</p>",
      participants: {
        create: [
          {
            code: "P01",
            orderIndex: 0,
            notes: "Usuario frecuente que reserva citas y servicios en línea cada semana.",
          },
        ],
      },
      tasks: {
        create: [
          {
            orderIndex: 0,
            startPoint: "Página de inicio de la plataforma",
            goalDescription: "Consultar el estado de una reserva existente",
            successCriterion:
              "El participante visualiza el detalle de la reserva con su estado actualizado",
            maxTimeMinutes: 5,
            askSatisfaction: true,
            scenarioNarrative:
              "Hace unos días reservaste un servicio y quieres confirmar si sigue vigente. Entra a la plataforma y averigua en qué estado se encuentra tu reserva.",
          },
          {
            orderIndex: 1,
            startPoint: "Panel principal tras iniciar sesión",
            goalDescription: "Actualizar el número de teléfono de contacto",
            successCriterion:
              "El participante guarda un nuevo teléfono y ve confirmación del cambio",
            maxTimeMinutes: 4,
            askSatisfaction: false,
            scenarioNarrative:
              "Cambiaste de número y necesitas que la plataforma te envíe recordatorios al teléfono correcto. Actualiza tu información de contacto.",
          },
          {
            orderIndex: 2,
            startPoint: "Sección de historial de reservas",
            goalDescription: "Descargar un comprobante de una reserva completada",
            successCriterion:
              "El participante descarga o visualiza el comprobante en PDF",
            maxTimeMinutes: 6,
            askSatisfaction: true,
            scenarioNarrative:
              "Necesitas un comprobante de una reserva que ya utilizaste. Busca en la plataforma cómo obtener ese documento.",
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
