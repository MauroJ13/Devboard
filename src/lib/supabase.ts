import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

/** Supabase ist nur aktiv, wenn beide Werte in .env.local gesetzt sind */
export const isSupabaseConfigured = /^https?:\/\//.test(url) && anonKey.length > 0;

/**
 * Supabase-Client oder null (dann arbeitet die App rein lokal mit localStorage).
 * Die Secrets kommen ausschließlich aus Umgebungsvariablen (.env.local), nie aus dem Code.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: false },
    })
  : null;
