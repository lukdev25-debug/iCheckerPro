/*
# Auto-confirm new users

## Overview
Email confirmation is enabled but no SMTP is configured, so users can't
confirm their email and can't sign in. This trigger auto-confirms users
by setting email_confirmed_at and confirmed_at on insert.

## Changes
- Function `public.auto_confirm_user()` — SECURITY DEFINER, sets
  email_confirmed_at and confirmed_at on the NEW row.
- Trigger `on_auth_user_autoconfirm` — BEFORE INSERT on auth.users.
*/

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'auth'
AS $$
BEGIN
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  NEW.email_change_confirm_status := 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_autoconfirm ON auth.users;
CREATE TRIGGER on_auth_user_autoconfirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();
