import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function getZunaWorkspaceId() {
  return process.env.ZUNA_WORKSPACE_ID || "7c6cdc5f-e6d3-47e3-8347-a2c8caead95a";
}
