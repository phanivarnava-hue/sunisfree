import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = await createClient();
  await supabase.rpc("increment_sunisfree_views", { post_slug: slug });

  return NextResponse.json({ ok: true });
}
