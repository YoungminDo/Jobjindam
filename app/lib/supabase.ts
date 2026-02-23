// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ?? "missing"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? "exists" : "missing"}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
