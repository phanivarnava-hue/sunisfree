"use client";

import { RefObject, useRef } from "react";

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = "",
  placeholder: string = ""
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const text = selectedText || placeholder;

  const newValue =
    textarea.value.substring(0, start) +
    before +
    text +
    after +
    textarea.value.substring(end);

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;
  nativeInputValueSetter?.call(textarea, newValue);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  textarea.focus();
  const cursorPos = start + before.length + text.length;
  textarea.setSelectionRange(cursorPos, cursorPos);
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string) {
  const start = textarea.selectionStart;
  const newValue =
    textarea.value.substring(0, start) + text + textarea.value.substring(start);

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;
  nativeInputValueSetter?.call(textarea, newValue);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  textarea.focus();
  const cursorPos = start + text.length;
  textarea.setSelectionRange(cursorPos, cursorPos);
}

const buttons = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic text" },
  { label: "H2", title: "Heading 2", before: "## ", after: "", placeholder: "Heading" },
  { label: "H3", title: "Heading 3", before: "### ", after: "", placeholder: "Heading" },
  { label: "Link", title: "Link", before: "[", after: "](url)", placeholder: "link text" },
  { label: "UL", title: "Unordered List", before: "- ", after: "", placeholder: "item" },
  { label: "OL", title: "Ordered List", before: "1. ", after: "", placeholder: "item" },
  { label: ">", title: "Blockquote", before: "> ", after: "", placeholder: "quote" },
  { label: "</>", title: "Code Block", before: "```\n", after: "\n```", placeholder: "code" },
];

export default function MarkdownToolbar({ textareaRef }: MarkdownToolbarProps) {
  const imgInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    if (!textareaRef.current) return;

    // Insert placeholder while uploading
    const placeholder = `\n![Uploading ${file.name}...]()\n`;
    insertAtCursor(textareaRef.current, placeholder);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        // Replace placeholder with actual image
        const current = textareaRef.current.value;
        const replaced = current.replace(
          placeholder.trim(),
          `![${file.name}](${data.url})`
        );
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(textareaRef.current, replaced);
        textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch {
      // Remove placeholder on error
      const current = textareaRef.current.value;
      const replaced = current.replace(placeholder.trim(), "");
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(textareaRef.current, replaced);
      textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-green-50 border border-green-200 rounded-t-lg border-b-0">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          title={btn.title}
          onClick={() => {
            if (textareaRef.current) {
              insertMarkdown(
                textareaRef.current,
                btn.before,
                btn.after,
                btn.placeholder
              );
            }
          }}
          className="px-2.5 py-1 text-xs font-mono font-semibold text-green-800 bg-white border border-green-200 rounded hover:bg-green-100 hover:border-green-300 transition-colors"
        >
          {btn.label}
        </button>
      ))}

      {/* Image upload button */}
      <button
        type="button"
        title="Insert Image"
        onClick={() => imgInputRef.current?.click()}
        className="px-2.5 py-1 text-xs font-mono font-semibold text-green-800 bg-white border border-green-200 rounded hover:bg-green-100 hover:border-green-300 transition-colors"
      >
        Img
      </button>
      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
