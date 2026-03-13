"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MarkdownToolbar from "@/app/components/MarkdownToolbar";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedPass = localStorage.getItem("sunisfree_passphrase");

    if (storedPass !== process.env.NEXT_PUBLIC_WRITER_PASSPHRASE) {
      router.push("/write");
      return;
    }

    setAuthenticated(true);

    async function loadPost() {
      const { data: post } = await supabase
        .from("sunisfree_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (!post) {
        router.push("/write");
        return;
      }

      setTitle(post.title);
      setSlug(post.slug);
      setAuthorName(post.author_name);
      setTags((post.tags || []).join(", "));
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCoverImageUrl(post.cover_image_url || "");
      setPublished(post.published);
      setLoading(false);
    }
    loadPost();
  }, [id, router, supabase]);

  async function handleImageUpload(file: File) {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setCoverImageUrl(data.url);
      }
    } catch {
      setError("Upload failed");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }

  async function handleUpdate() {
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
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      cover_image_url: coverImageUrl || null,
    };

    const { error: dbError } = await supabase
      .from("sunisfree_posts")
      .update(postData)
      .eq("id", id);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      router.push("/write");
    }
  }

  async function handleTogglePublish() {
    setSaving(true);
    const newPublished = !published;

    const updateData: Record<string, unknown> = { published: newPublished };
    if (newPublished) {
      updateData.published_at = new Date().toISOString();
    }

    const { error: dbError } = await supabase
      .from("sunisfree_posts")
      .update(updateData)
      .eq("id", id);

    if (dbError) {
      setError(dbError.message);
    } else {
      setPublished(newPublished);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    const { error: dbError } = await supabase
      .from("sunisfree_posts")
      .delete()
      .eq("id", id);

    if (!dbError) {
      router.push("/write");
    } else {
      setError(dbError.message);
    }
  }

  if (!authenticated || loading) {
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
        Edit Post
      </h1>

      <div className="space-y-5">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          {coverImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-green-200">
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors"
            >
              <svg className="w-10 h-10 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                {uploading ? "Uploading..." : "Click or drag to upload cover image"}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, or WebP (max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-mono text-sm"
          />
        </div>

        {/* Author + Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
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
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Update
          </button>
          <button
            onClick={handleTogglePublish}
            disabled={saving}
            className={`px-5 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${
              published
                ? "border border-orange-300 text-orange-700 hover:bg-orange-50"
                : "border border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            {published ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-5 py-2.5 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
