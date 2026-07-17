// src/lib/supabase.ts
// Backwards-compatibility shim: exports a noop-safe supabase client so that
// imports from old modules (src/lib/supabase.ts) will not cause build failures
// when @supabase/supabase-js is not installed.

import supabase from '../supabaseClient';

export default supabase;

// also export createClient if some modules expect it
export { createClient } from '../lib/supabaseClient';
