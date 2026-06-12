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
          ? "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8"
          : "px-4 py-6"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Situación {situationNumber}
      </p>
      <p className="mt-8 text-2xl leading-relaxed font-light tracking-tight text-slate-800">
        {narrative || "Escribe el escenario narrativo para previsualizarlo aquí."}
      </p>
    </article>
  );
}
