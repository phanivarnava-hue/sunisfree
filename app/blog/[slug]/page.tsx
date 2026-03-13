import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("sunisfree_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    notFound();
  }

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800 mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all posts
      </Link>

      <header className="mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold text-green-900 mb-3"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>{post.author_name}</span>
          {date && (
            <>
              <span>&middot;</span>
              <span>{date}</span>
            </>
          )}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full rounded-xl mb-8 object-cover max-h-96"
        />
      )}

      <MarkdownRenderer content={post.content} />
    </article>
  );
}
