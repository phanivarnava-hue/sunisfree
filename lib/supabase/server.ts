import { PostgrestClient } from "@supabase/postgrest-js";

export async function createClient() {
  return new PostgrestClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    schema: "public",
  });
}
