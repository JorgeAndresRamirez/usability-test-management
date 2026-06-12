import { prepareDisplayHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html: string;
  variant?: "list" | "prose" | "inline";
  className?: string;
  emptyFallback?: string;
  as?: "div" | "h1" | "h2" | "p";
};

const variantStyles = {
  list: cn(
    "[&_ul]:mt-0 [&_ul]:list-none [&_ul]:space-y-5 [&_ul]:p-0",
    "[&_li]:flex [&_li]:gap-4 [&_li]:leading-relaxed",
    "[&_li]:before:mt-1.5 [&_li]:before:size-1.5 [&_li]:before:shrink-0 [&_li]:before:rounded-full [&_li]:before:bg-indigo-400 [&_li]:before:content-['']",
    "[&_p]:my-0",
    "[&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_u]:decoration-slate-400 [&_u]:underline-offset-2",
  ),
  prose: cn(
    "[&_p]:my-0 [&_p+_p]:mt-4",
    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
    "[&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_u]:decoration-slate-400 [&_u]:underline-offset-2",
  ),
  inline: cn(
    "[&_p]:inline [&_strong]:font-semibold [&_em]:italic [&_u]:underline",
  ),
};

export function RichTextContent({
  html,
  variant = "prose",
  className,
  emptyFallback,
  as: Tag = "div",
}: RichTextContentProps) {
  const sanitized = prepareDisplayHtml(html, variant);

  if (!sanitized) {
    return emptyFallback ? <Tag className={className}>{emptyFallback}</Tag> : null;
  }

  return (
    <Tag
      className={cn("rich-text-content", variantStyles[variant], className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
