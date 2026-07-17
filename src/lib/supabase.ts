import supabaseDefault from '../lib/supabaseClient';

// Export both named and default to match existing imports like: `import { supabase } from './supabase'`
export const supabase = supabaseDefault;
export default supabaseDefault;

// Re-export createClient for compatibility
export { createClient } from '../lib/supabaseClient';
