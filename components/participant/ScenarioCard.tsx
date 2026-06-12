import { RichTextContent } from "@/components/ui/rich-text-content";

type ScenarioCardProps = {
  situationNumber: number;
  narrative: string;
  preview?: boolean;
};

export function ScenarioCard({
  situationNumber,
  narrative,
  preview = false,
}: ScenarioCardProps) {
  return (
    <article
      className={`mx-auto w-full max-w-2xl ${
        preview
          ? "rounded-2xl border border-dashed border-border bg-secondary/40 p-8"
          : "animate-fade-up px-4 py-6"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Situación {situationNumber}
      </p>
      <RichTextContent
        html={narrative}
        variant="prose"
        className="font-display mt-10 text-balance text-3xl font-medium leading-snug tracking-tight text-foreground"
        emptyFallback="Escribe el escenario narrativo para previsualizarlo aquí."
      />
    </article>
  );
}
