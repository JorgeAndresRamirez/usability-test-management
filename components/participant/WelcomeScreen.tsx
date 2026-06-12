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
          ? "rounded-2xl border border-dashed border-border bg-secondary/40 p-8"
          : "animate-fade-up px-4 py-6"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Bienvenida
      </p>
      <RichTextContent
        as="h1"
        html={title}
        variant="inline"
        className="font-display mt-8 text-balance text-4xl font-medium tracking-tight text-foreground"
      />
      {hasInstructions ? (
        <RichTextContent
          html={instructions}
          variant="list"
          className="mt-12 text-lg leading-relaxed font-normal text-muted-foreground"
        />
      ) : (
        <p className="mt-10 text-lg leading-relaxed text-muted-foreground">
          Escribe las indicaciones para previsualizarlas aquí.
        </p>
      )}
    </article>
  );
}
