// src/lib/supabaseClient.ts
// Improved no-op Supabase client shim that supports the common chainable
// query builder API (from(...).select(...).eq(...).maybeSingle() etc.) so the
// app won't crash if Supabase isn't configured. The real supabase-js API
// returns a chainable query builder where `.select()` returns an object that
// supports `.eq()`, `.single()`, `.maybeSingle()`, and is awaitable (thenable).

type SafeResult = Promise<{ data: any | null; error: any | null }>;

const noopAsync = async (..._args: any[]): Promise<{ data: null; error: null }> => ({ data: null, error: null });

function makeThenableResult(): any {
  const promise = Promise.resolve({ data: null, error: null });
  // A very small query-builder-like object that is both chainable and thenable
  const qb: any = {
    select: (..._args: any[]) => qb,
    eq: (_field: string, _value: any) => qb,
    neq: (_field: string, _value: any) => qb,
    order: (..._args: any[]) => qb,
    limit: (_n: number) => qb,
    range: (_a: number, _b: number) => qb,
    single: () => promise,
    maybeSingle: () => promise,
    then: (onFulfilled: any, onRejected: any) => promise.then(onFulfilled, onRejected),
    catch: (onRejected: any) => promise.catch(onRejected),
    // support chaining .returns or .rpc if some code expects them
    returns: () => promise,
    rpc: () => promise,
  };

  return qb;
}

const safeFrom = (_table: string) => ({
  select: (..._args: any[]) => makeThenableResult(),
  insert: (_data: any) => noopAsync(_data),
  update: (_data: any) => noopAsync(_data),
  delete: (_args: any) => noopAsync(_args),
  upsert: (_data: any) => noopAsync(_data),
  eq: (_field: string, _value: any) => ({ select: () => makeThenableResult() }),
  single: async () => ({ data: null, error: null }),
  maybeSingle: async () => ({ data: null, error: null }),
  limit: (_n: number) => ({ select: () => makeThenableResult() }),
});

const safeClient = {
  from: safeFrom,
  rpc: async (..._args: any[]) => ({ data: null, error: null }),
  auth: {
    signIn: async (..._args: any[]) => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
    user: () => null,
    getUser: async () => ({ data: null, error: null }),
    onAuthStateChange: (_cb: any) => ({ data: null }),
  },
  storage: {
    from: () => ({ upload: async () => ({ data: null, error: null }), getPublicUrl: async () => ({ data: null }) }),
  },
};

// Exported factory to keep compatibility with code that might call createClient.
export function createClient(url?: string | null, key?: string | null) {
  // If both url and key are provided, try to dynamically require the real client.
  if (url && key) {
    try {
      // Attempt to require the real @supabase/supabase-js package if present
      // (this will work in Node environments that have it installed).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const supabaseModule = require('@supabase/supabase-js');
      if (supabaseModule && supabaseModule.createClient) {
        return supabaseModule.createClient(url, key);
      }
    } catch (e) {
      // ignore and fall back to safe client
      // eslint-disable-next-line no-console
      console.warn('[supabaseClient] @supabase/supabase-js not available at runtime, using noop client.');
    }
  }

  // If url/key not provided or real client unavailable, return the safe noop client
  console.warn('[supabaseClient] Supabase not configured — returning safe noop client.');
  return safeClient as any;
}

// Default export: a no-op client (keeps existing import styles working)
const defaultClient = safeClient as any;
export default defaultClient;
