import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw an explicit error during build/runtime if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your environment configuration on your hosting provider.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);