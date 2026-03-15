import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  const { passphrase } = await request.json();
  const correct = process.env.WRITER_PASSPHRASE;

  if (!correct || passphrase !== correct) {
    return NextResponse.json({ error: "Wrong passphrase" }, { status: 401 });
  }

  const token = generateToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("writer_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Store token server-side in env (in-memory for this process)
  // For a simple blog this is fine — token resets on redeploy
  globalThis.__writerTokens = globalThis.__writerTokens || new Set();
  (globalThis.__writerTokens as Set<string>).add(token);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("writer_token");
  return response;
}
