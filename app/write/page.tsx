"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  views: number;
}

export default function WriteDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check if already authenticated via cookie
    fetch("/api/auth/check")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
          setAuthorName(localStorage.getItem("sunisfree_author") || "");
          loadPosts();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPosts() {
    const { data } = await supabase
      .from("sunisfree_posts")
      .select("id, title, slug, published, published_at, created_at, updated_at, author_name, views")
      .order("updated_at", { ascending: false });

    setPosts(data || []);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });

    if (res.ok) {
      localStorage.setItem("sunisfree_author", authorName.trim() || "Anonymous");
      setAuthenticated(true);
      setLoading(true);
      loadPosts();
    } else {
      setError("Wrong passphrase");
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth", { method: "DELETE" });
    localStorage.removeItem("sunisfree_author");
    setAuthenticated(false);
    setPassphrase("");
    setAuthorName("");
    setPosts([]);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const { error: dbError } = await supabase
      .from("sunisfree_posts")
      .delete()
      .eq("id", id);

    if (!dbError) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  // Gate: passphrase form
  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1
            className="text-2xl font-bold text-green-900 text-center mb-8"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Enter to write
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-1">
                Passphrase
              </label>
              <input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter passphrase"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Your name"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">
        Loading...
      </div>
    );
  }

  const storedAuthor = localStorage.getItem("sunisfree_author") || "Writer";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-green-900"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            All Posts
          </h1>
          <p className="text-sm text-muted mt-1">
            Welcome back, {storedAuthor}
            {" "}
            <button
              onClick={() => {
                const newName = prompt("Enter new name:", storedAuthor);
                if (newName !== null && newName.trim()) {
                  localStorage.setItem("sunisfree_author", newName.trim());
                  setAuthorName(newName.trim());
                }
              }}
              className="text-green-600 hover:text-green-800 underline"
            >
              change name
            </button>
            {" · "}
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              sign out
            </button>
          </p>
        </div>
        <Link
          href="/write/new"
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg mb-4">No posts yet.</p>
          <Link
            href="/write/new"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between bg-white border border-green-100 rounded-lg p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-green-900 truncate">
                    {post.title}
                  </h2>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  by {post.author_name} · {post.views || 0} views · Updated{" "}
                  {new Date(post.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Link
                  href={`/write/edit/${post.id}`}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
