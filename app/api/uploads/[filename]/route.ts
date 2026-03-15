import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(filename);
  const ext = path.extname(safe).toLowerCase();

  if (!MIME_TYPES[ext]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Try multiple possible paths (standalone mode can change cwd)
  const candidates = [
    path.join(process.cwd(), "public", "uploads", safe),
    path.join("/app", "public", "uploads", safe),
    path.join("/app/public/uploads", safe),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = await readFile(filePath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": MIME_TYPES[ext],
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // try next path
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
