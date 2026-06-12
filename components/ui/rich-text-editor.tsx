"use client";

import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, Underline as UnderlineIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isHtmlContent, normalizeEditorHtml, plainTextToHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
  /** inline: título (sin viñetas). list: indicaciones. prose: narrativa. */
  variant?: "inline" | "list" | "prose";
  id?: string;
  "aria-invalid"?: boolean;
};

function toEditorContent(value: string, variant: "inline" | "list" | "prose"): string {
  if (!value.trim()) return "";
  if (isHtmlContent(value)) return value;
  return plainTextToHtml(value, variant);
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder,
  minHeight = "10rem",
  variant = "prose",
  id,
  "aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        orderedList: false,
        bulletList: variant === "inline" ? false : undefined,
      }),
      Underline,
    ],
    content: toEditorContent(value, variant),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 text-sm text-slate-800 focus:outline-none",
          "prose-p:my-1 prose-ul:my-2 prose-li:my-0.5",
          "[&_p.is-editor-empty:first-child]:before:pointer-events-none",
          "[&_p.is-editor-empty:first-child]:before:float-left",
          "[&_p.is-editor-empty:first-child]:before:h-0",
          "[&_p.is-editor-empty:first-child]:before:text-slate-400",
          "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        ),
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(normalizeEditorHtml(current.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = normalizeEditorHtml(editor.getHTML());
    const next = normalizeEditorHtml(toEditorContent(value, variant));
    if (current !== next) {
      editor.commands.setContent(next || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value, variant]);

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-input bg-transparent"
        style={{ minHeight }}
      />
    );
  }

  const toolBtn = (active: boolean) =>
    cn(active && "bg-slate-200 text-slate-900", "size-8 shrink-0");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-transparent transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        ariaInvalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      {!disabled && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-1 py-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolBtn(editor.isActive("bold"))}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrita"
            aria-label="Negrita"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolBtn(editor.isActive("italic"))}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Cursiva"
            aria-label="Cursiva"
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolBtn(editor.isActive("underline"))}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Subrayado"
            aria-label="Subrayado"
          >
            <UnderlineIcon className="size-4" />
          </Button>
          {variant !== "inline" && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={toolBtn(editor.isActive("bulletList"))}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Lista con viñetas"
              aria-label="Lista con viñetas"
            >
              <List className="size-4" />
            </Button>
          )}
        </div>
      )}
      <EditorContent
        editor={editor}
        className="rich-text-editor"
        style={{ minHeight }}
      />
    </div>
  );
}
