/*
# Create api_keys table for storing third-party API keys

## Overview
Stores third-party API keys (like sickw.com) for use by edge functions.
Only accessible via the service role key (RLS enabled, no policies = locked down).

## New Tables
- `api_keys`
  - `id` (uuid, PK)
  - `name` (text, unique) — key identifier e.g. 'SICKW_API_KEY'
  - `value` (text) — the actual key
  - `created_at` (timestamptz)

## Security
- RLS enabled with NO policies — only the service role (which bypasses RLS) can read/write.
- Frontend anon/authenticated users cannot access this table at all.
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Insert the sickw API key
INSERT INTO api_keys (name, value)
VALUES ('SICKW_API_KEY', '8VU-H1C-PPE-PR5-EST-2K1-GTT-KC8')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;
