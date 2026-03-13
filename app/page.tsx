import { createClient } from "@/lib/supabase/server";
import PostCard from "./components/PostCard";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("sunisfree_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-[#FAFDF7] to-green-50 gradient-shift py-20 sm:py-28">
        {/* Floating decorative dots */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-16 left-[10%] w-3 h-3 rounded-full bg-green-400/40 leaf-float" />
          <div className="absolute top-24 right-[15%] w-2 h-2 rounded-full bg-green-500/30 leaf-float-delay-1" />
          <div className="absolute bottom-20 left-[25%] w-4 h-4 rounded-full bg-green-300/30 leaf-float-delay-2" />
          <div className="absolute top-32 left-[60%] w-2.5 h-2.5 rounded-full bg-green-400/25 leaf-float-delay-3" />
          <div className="absolute bottom-12 right-[30%] w-3 h-3 rounded-full bg-green-500/20 gentle-pulse" />
          <div className="absolute top-10 left-[45%] w-2 h-2 rounded-full bg-green-600/20 gentle-pulse" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Sun Is Free
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            Honest takes on sustainability, energy independence, and why the
            transition matters.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {posts && posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                author_name={post.author_name}
                published_at={post.published_at}
                tags={post.tags || []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No posts yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
