import Link from "next/link";

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  author_name: string;
  published_at: string | null;
  tags: string[];
}

export default function PostCard({
  slug,
  title,
  excerpt,
  author_name,
  published_at,
  tags,
}: PostCardProps) {
  const date = published_at
    ? new Date(published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/blog/${slug}`} className="block group">
      <article className="bg-white rounded-xl border border-green-100 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-green-100/50 hover:border-green-300 hover:-translate-y-0.5">
        <h2
          className="text-xl font-bold text-green-900 group-hover:text-green-700 transition-colors mb-2"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          {title}
        </h2>
        {excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{author_name}</span>
          {date && (
            <>
              <span>&middot;</span>
              <span>{date}</span>
            </>
          )}
          {tags.length > 0 && (
            <>
              <span>&middot;</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </article>
    </Link>
  );
}
