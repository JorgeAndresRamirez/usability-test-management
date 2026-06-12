type WelcomeScreenProps = {
  title: string;
  instructions: string;
  preview?: boolean;
};

function parseInstructions(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function WelcomeScreen({ title, instructions, preview = false }: WelcomeScreenProps) {
  const items = parseInstructions(instructions);

  return (
    <article
      className={`mx-auto w-full max-w-2xl ${
        preview
          ? "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8"
          : "px-4 py-6"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Bienvenida
      </p>
      <h1 className="mt-6 text-3xl font-light tracking-tight text-slate-800">{title}</h1>
      {items.length > 0 ? (
        <ul className="mt-10 space-y-5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex gap-4 text-lg leading-relaxed font-light text-slate-700"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-lg font-light leading-relaxed text-slate-500">
          Escribe las indicaciones para previsualizarlas aquí.
        </p>
      )}
    </article>
  );
}
