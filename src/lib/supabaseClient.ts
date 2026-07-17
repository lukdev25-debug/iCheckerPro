// src/lib/supabaseClient.ts
// Shim to avoid app-crashing when Supabase env vars are missing.
// If you no longer want to use Supabase, this module will safely return a noop client
// so the app doesn't throw on initialization. You can gradually replace usages
// with Firebase implementations.

type SafeResult = Promise<{ data: any | null; error: any | null }>;

const noop = async (..._args: any[]): SafeResult => ({ data: null, error: null });

const safeFrom = (_table: string) => ({
  select: noop,
  insert: noop,
  update: noop,
  delete: noop,
  upsert: noop,
  eq: () => ({ select: noop }),
  single: async () => ({ data: null, error: null }),
  maybeSingle: async () => ({ data: null, error: null }),
  limit: () => ({ select: noop }),
});

const safeClient = {
  from: safeFrom,
  rpc: noop,
  auth: {
    signIn: noop,
    signOut: noop,
    user: () => null,
    getUser: noop,
  },
  storage: {
    from: () => ({ upload: noop, getPublicUrl: () => ({ data: null }) }),
  },
};

function getEnvVarCandidates() {
  // Support common patterns used in CRA and Vite projects
  // Vite: import.meta.env.VITE_SUPABASE_URL
  // CRA: process.env.REACT_APP_SUPABASE_URL
  // fallback generic: process.env.SUPABASE_URL
  const vite = typeof import.meta !== 'undefined' && (import.meta as any).env;
  const viteEnv = vite ? (vite as any).VITE_SUPABASE_URL : undefined;
  const viteKey = vite ? (vite as any).VITE_SUPABASE_ANON_KEY : undefined;

  const reactUrl = typeof process !== 'undefined' ? (process.env as any).REACT_APP_SUPABASE_URL : undefined;
  const reactKey = typeof process !== 'undefined' ? (process.env as any).REACT_APP_SUPABASE_ANON_KEY : undefined;

  const genericUrl = typeof process !== 'undefined' ? (process.env as any).SUPABASE_URL : undefined;
  const genericKey = typeof process !== 'undefined' ? (process.env as any).SUPABASE_ANON_KEY : undefined;

  return {
    url: viteEnv || reactUrl || genericUrl,
    key: viteKey || reactKey || genericKey,
  };
}

export function createClient(url?: string | null, key?: string | null) {
  const u = url ?? getEnvVarCandidates().url;
  const k = key ?? getEnvVarCandidates().key;

  if (!u || !k) {
    // Return a safe no-op client so the app doesn't crash when Supabase isn't configured.
    console.warn('[supabaseClient] Supabase not configured — returning safe noop client.');
    return safeClient as any;
  }

  try {
    // Attempt to load the real Supabase client if available
    // Use dynamic import so bundlers that don't include @supabase/supabase-js won't fail at build time.
    // Note: in some environments this will be async; we require a sync return, so use require fallback.
    // Try global require (Node) first
    let supabaseModule: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      supabaseModule = require('@supabase/supabase-js');
    } catch (e) {
      // ignore
    }

    if (supabaseModule && supabaseModule.createClient) {
      return supabaseModule.createClient(u, k);
    }

    // If require isn't available (browser), try dynamic import (note: dynamic import is async)
    // but we still can't await here; fallback to safe client with a console warning.
    console.warn('[supabaseClient] @supabase/supabase-js not found at runtime — using noop client.');
    return safeClient as any;
  } catch (err) {
    console.error('[supabaseClient] Error creating supabase client', err);
    return safeClient as any;
  }
}

// Default export: a client created from environment
const env = getEnvVarCandidates();
const supabase = createClient(env.url, env.key);
export default supabase;
