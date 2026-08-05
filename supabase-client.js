// Supabase client initialization for Nexus Forensics
// Waits for the CDN SDK to load, then creates the client.

(function () {
  const SUPABASE_URL = window.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Nexus] Supabase configuration missing. Check your .env file.');
    window.nexusSupabase = null;
    return;
  }

  function init() {
    if (!window.supabase || !window.supabase.createClient) {
      // SDK not loaded yet, retry shortly
      return setTimeout(init, 50);
    }
    window.nexusSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Nexus] Supabase client connected.');
  }

  init();
})();
