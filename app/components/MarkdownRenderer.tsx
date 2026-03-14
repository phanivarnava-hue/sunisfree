import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Collapse single newlines within paragraphs into spaces
  // while preserving double newlines (paragraph breaks) and headings
  const normalizedContent = content.replace(/([^\n])\n(?!\n|#|[-*>]|\d+\.|!\[|\*\*)/g, "$1 ");

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
