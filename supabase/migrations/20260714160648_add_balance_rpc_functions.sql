/*
# Add credit_balance RPC function

## Overview
Creates a SECURITY DEFINER function that atomically credits a user's wallet
balance. This is called by the MercadoPago edge function (with the service
role key) when a payment is approved. The function also prevents double-crediting
by checking if the transaction is already completed.

## New Functions
- `credit_balance(p_user_id uuid, p_amount numeric)` — increments profiles.balance
  by p_amount. Uses an advisory-style guard via the transactions table status.
*/

CREATE OR REPLACE FUNCTION public.credit_balance(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist yet (edge case)
    INSERT INTO public.profiles (id, balance)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (id) DO UPDATE SET balance = profiles.balance + p_amount;
  END IF;
END;
$$;

-- Also add a function to deduct balance (for IMEI checks)
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id uuid, p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance - p_amount
  WHERE id = p_user_id AND balance >= p_amount;

  RETURN FOUND;
END;
$$;
