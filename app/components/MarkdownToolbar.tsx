"use client";

import { RefObject } from "react";

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

  // Trigger React-compatible change
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;
  nativeInputValueSetter?.call(textarea, newValue);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Restore focus and selection
  textarea.focus();
  const cursorPos = start + before.length + text.length;
  textarea.setSelectionRange(cursorPos, cursorPos);
}

const buttons = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic text" },
  { label: "H2", title: "Heading 2", before: "## ", after: "", placeholder: "Heading" },
  { label: "H3", title: "Heading 3", before: "### ", after: "", placeholder: "Heading" },
  { label: "Link", title: "Link", before: "[", after: "](url)", placeholder: "link text" },
  { label: "Img", title: "Image", before: "![", after: "](url)", placeholder: "alt text" },
  { label: "UL", title: "Unordered List", before: "- ", after: "", placeholder: "item" },
  { label: "OL", title: "Ordered List", before: "1. ", after: "", placeholder: "item" },
  { label: ">", title: "Blockquote", before: "> ", after: "", placeholder: "quote" },
  { label: "</>", title: "Code Block", before: "```\n", after: "\n```", placeholder: "code" },
];

export default function MarkdownToolbar({ textareaRef }: MarkdownToolbarProps) {
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
    </div>
  );
}
