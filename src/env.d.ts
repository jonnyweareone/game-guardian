/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly TTS_MULTI_VOICE?: string // Environment flag to disable multi-voice TTS
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}