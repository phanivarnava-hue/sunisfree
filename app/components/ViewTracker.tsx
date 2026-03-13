"use client";

import { useEffect } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `sunisfree_viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
  }, [slug]);

  return null;
}
