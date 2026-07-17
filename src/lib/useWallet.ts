import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

export interface ImeiCheck {
  id: string;
  imei: string;
  service: string;
  status: string;
  result: any;
  price: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  provider: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  balance: number;
}

export function useWallet() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checks, setChecks] = useState<ImeiCheck[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, email, balance')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  }, [user]);

  const fetchChecks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('imei_checks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setChecks(data as ImeiCheck[]);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setTransactions(data as Transaction[]);
  }, [user]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchChecks(), fetchTransactions()]);
    setLoading(false);
  }, [fetchProfile, fetchChecks, fetchTransactions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, checks, transactions, loading, refresh };
}
