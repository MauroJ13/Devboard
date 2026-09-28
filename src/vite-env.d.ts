/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Projekt-URL, z. B. https://abcdefgh.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Öffentlicher "anon"/"publishable" Key – NIEMALS den service_role Key verwenden */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
