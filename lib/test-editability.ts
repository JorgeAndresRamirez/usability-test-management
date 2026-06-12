export const TEST_CONFIG_LOCKED_MESSAGE =
  "No se puede editar la configuración: ya hay participantes o respuestas registradas. Clona el proyecto para crear una copia editable.";

export type TestEditabilityCounts = {
  participantCount: number;
  executionCount: number;
};

export function isTestConfigurationEditable(counts: TestEditabilityCounts): boolean {
  return counts.participantCount === 0 && counts.executionCount === 0;
}
