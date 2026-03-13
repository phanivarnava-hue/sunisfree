export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1
        className="text-3xl sm:text-4xl font-bold text-green-900 mb-6"
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        About Sun Is Free
      </h1>

      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          The sun doesn&apos;t send a bill. That simple fact is the starting
          point for everything we write about here.
        </p>
        <p>
          <strong className="text-green-900">Sun Is Free</strong> is a blog
          about the messy, exciting, sometimes frustrating reality of the energy
          transition. We write about solar panels and heat pumps, sure, but also
          about the policies, economics, and everyday choices that shape whether
          we actually get to a sustainable future.
        </p>
        <p>
          No greenwashing. No corporate speak. Just honest writing about what
          works, what doesn&apos;t, and what we&apos;re still figuring out.
        </p>
        <p>
          We believe energy independence isn&apos;t just an environmental issue
          - it&apos;s about freedom, resilience, and building communities
          that can take care of themselves. The technology is here. The question
          is whether we&apos;ll use it.
        </p>
        <p className="text-muted text-sm pt-4">
          Got something to say? Ideas for a post? Reach out. This is a
          conversation, not a lecture.
        </p>
      </div>
    </div>
  );
}
