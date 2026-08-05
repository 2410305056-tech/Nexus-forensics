// Supabase client initialization for Nexus Forensics
// Reads config from Vite env vars (exposed as window.VITE_* in this static setup)

const SUPABASE_URL = window.VITE_SUPABASE_URL || import.meta?.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.VITE_SUPABASE_ANON_KEY || import.meta?.env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Nexus] Supabase configuration missing. Check your .env file.');
}

const supabase = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!supabase) {
  console.error('[Nexus] Supabase SDK failed to load.');
}

window.nexusSupabase = supabase;
