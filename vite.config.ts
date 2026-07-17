import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect any import of the Supabase package to the local shim to
      // avoid bundling the real @supabase/supabase-js and to prevent runtime
      // initialization errors when env vars are missing.
      '@supabase/supabase-js': resolve(__dirname, 'src/lib/supabaseClient.ts')
    }
  }
})
