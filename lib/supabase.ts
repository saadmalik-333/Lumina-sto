
import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION SUPABASE CONFIGURATION
 * Prioritizes environment variables (Vite/Node) with provided production fallbacks.
 * Security: Configured with sessionStorage to clear session on tab/browser close.
 * Strict Force Re-login: Set persistSession to false to ensure a fresh login on page reload if required.
 */
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    'https://peosewioliuyozdjziep.supabase.co';

const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY || 
                    'sb_publishable_jn7yaeIrf5iNeFSS8fAiMg_RFWzQJOL';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: window.sessionStorage, // Clear session on browser close
    autoRefreshToken: true,
    persistSession: true, // Allow session persistence within the tab (survives refresh but cleared on tab close)
    detectSessionInUrl: true
  }
});

// Exporting a flag for internal consistency, always true now.
export const isSupabaseConfigured = true;
