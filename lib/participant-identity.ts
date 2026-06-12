const PARTICIPANT_PALETTE = [
  { bg: "bg-accent", text: "text-accent-foreground", border: "border-primary/25", fill: "#5746AF" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", fill: "#16a34a" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", fill: "#d97706" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", fill: "#e11d48" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", fill: "#0891b2" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", fill: "#7c3aed" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", fill: "#ea580c" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", fill: "#0d9488" },
] as const;

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getParticipantPalette(code: string) {
  return PARTICIPANT_PALETTE[hashCode(code) % PARTICIPANT_PALETTE.length];
}

export function getParticipantInitials(code: string): string {
  const cleaned = code.replace(/[^a-zA-Z0-9]/g, "");
  if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase();
  return code.slice(0, 2).toUpperCase();
}
