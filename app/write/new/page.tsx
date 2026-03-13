"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarkdownToolbar from "@/app/components/MarkdownToolbar";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewPostPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedPass = localStorage.getItem("sunisfree_passphrase");
    const storedAuthor = localStorage.getItem("sunisfree_author");

    if (storedPass === process.env.NEXT_PUBLIC_WRITER_PASSPHRASE) {
      setAuthenticated(true);
      setAuthorName(storedAuthor || "Anonymous");
    } else {
      router.push("/write");
    }
  }, [router]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  }

  async function handleSave(publish: boolean) {
    setError("");
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || null,
      author_name: authorName.trim() || "Anonymous",
      author_id: null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    };

    const { error: dbError } = await supabase
      .from("sunisfree_posts")
      .insert(postData);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      router.push("/write");
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-2xl font-bold text-green-900 mb-8"
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        New Post
      </h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
            placeholder="Your post title"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-mono text-sm"
            placeholder="your-post-slug"
          />
        </div>

        {/* Author + Tags row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              placeholder="solar, energy, policy"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 resize-none"
            placeholder="A short summary of your post"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Content (Markdown)</label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>

          {preview ? (
            <div className="border border-green-200 rounded-lg p-6 bg-white min-h-[400px]">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <div>
              <MarkdownToolbar textareaRef={textareaRef} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-green-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-mono text-sm resize-y"
                placeholder="Write your post in Markdown..."
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2.5 border border-green-300 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
