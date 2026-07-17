/*
# FMI OFF - Database Schema

## Overview
Creates the core schema for the FMI OFF iPhone IMEI checking service.
Multi-user app with sign-in: each user has a profile with wallet balance,
can top up via MercadoPago, and spend balance on IMEI checks.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user
- `email` (text) — cached email for display
- `balance` (numeric, default 0) — wallet balance in USD
- `created_at` (timestamptz)

### imei_checks
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, default auth.uid())
- `imei` (text) — the IMEI submitted
- `service` (text) — which service was used (e.g. "fmi_off", "imei_check")
- `status` (text) — pending, completed, failed
- `result` (jsonb) — raw result from the check API
- `price` (numeric) — price charged
- `created_at` (timestamptz)

### transactions
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, default auth.uid())
- `amount` (numeric) — amount in USD
- `type` (text) — 'topup' or 'check'
- `status` (text) — pending, completed, failed
- `provider` (text) — 'mercadopago' etc.
- `provider_payment_id` (text) — MercadoPago payment/order ID
- `reference_id` (uuid) — links to imei_checks.id for check transactions
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD: authenticated users can only access their own rows.
- profiles: users can read/update their own profile (no insert needed —
  a trigger creates the profile on signup).
- A trigger `handle_new_user` creates a profile row when a new auth user signs up.

## Notes
1. Balance is stored in profiles.balance and managed via edge functions
   with the service role key (bypasses RLS) to ensure atomicity.
2. The frontend never directly modifies balance — only reads it.
3. imei_checks and transactions are insert/read-only from the client;
   status updates happen server-side via edge functions.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- imei_checks table
CREATE TABLE IF NOT EXISTS imei_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  imei text NOT NULL,
  service text NOT NULL DEFAULT 'fmi_off',
  status text NOT NULL DEFAULT 'pending',
  result jsonb,
  price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE imei_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_checks" ON imei_checks;
CREATE POLICY "select_own_checks" ON imei_checks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_checks" ON imei_checks;
CREATE POLICY "insert_own_checks" ON imei_checks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_checks" ON imei_checks;
CREATE POLICY "update_own_checks" ON imei_checks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('topup', 'check')),
  status text NOT NULL DEFAULT 'pending',
  provider text DEFAULT 'mercadopago',
  provider_payment_id text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_imei_checks_user_id ON imei_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_payment_id ON transactions(provider_payment_id);
