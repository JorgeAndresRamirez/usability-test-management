export type ParticipantWelcome = {
  title: string;
  instructions: string;
};

export type ParticipantScenario = {
  situationLabel: string;
  narrative: string;
};

export type ParticipantPresentation = {
  welcome: ParticipantWelcome | null;
  currentSituation: ParticipantScenario | null;
  totalSituations: number;
  sessionStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
};
