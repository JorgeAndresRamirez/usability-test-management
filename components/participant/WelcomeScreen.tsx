import { RichTextContent } from "@/components/ui/rich-text-content";

type WelcomeScreenProps = {
  title: string;
  instructions: string;
  preview?: boolean;
};

export function WelcomeScreen({ title, instructions, preview = false }: WelcomeScreenProps) {
  const hasInstructions = instructions.trim().length > 0;

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
      <RichTextContent
        as="h1"
        html={title}
        variant="inline"
        className="mt-6 text-3xl font-light tracking-tight text-slate-800"
      />
      {hasInstructions ? (
        <RichTextContent
          html={instructions}
          variant="list"
          className="mt-10 text-lg font-light text-slate-700"
        />
      ) : (
        <p className="mt-8 text-lg font-light leading-relaxed text-slate-500">
          Escribe las indicaciones para previsualizarlas aquí.
        </p>
      )}
    </article>
  );
}
