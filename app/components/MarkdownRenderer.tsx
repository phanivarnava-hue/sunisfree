import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Normalize content: ensure block elements (headings, lists, etc.) always have
  // blank lines around them, then collapse single newlines within paragraphs
  const normalizedContent = content
    // Ensure headings always have a blank line before them
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    // Ensure bold paragraph starts (like **Cooling savings.**) have a blank line before them
    .replace(/([^\n])\n(\*\*)/g, "$1\n\n$2")
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      // Don't touch headings, lists, blockquotes, images, or horizontal rules
      if (/^#{1,6}\s/.test(trimmed)) return trimmed;
      if (/^[-*+>]/.test(trimmed)) return trimmed;
      if (/^\d+\./.test(trimmed)) return trimmed;
      if (/^!\[/.test(trimmed)) return trimmed;
      if (/^---/.test(trimmed)) return trimmed;
      // Collapse single newlines within regular paragraphs
      return trimmed.replace(/\n/g, " ");
    })
    .join("\n\n");

  return (
    <div className="prose prose-green max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ""}
                className="w-full rounded-lg not-prose"
              />
              {alt && alt !== src && (
                <figcaption className="text-center text-sm text-gray-500 mt-2">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
