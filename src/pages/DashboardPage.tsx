import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useWallet } from '../lib/useWallet';
import SickwResult from '../components/SickwResult';
import WalletBinancePay from '../components/WalletBinancePay';
import {
  Wallet, Smartphone, History, LogOut, ShieldCheck, Loader2,
  AlertCircle, CheckCircle2, XCircle, ArrowDownCircle, Clock,
  Search, CreditCard, ExternalLink, X, ShieldAlert, ShieldCheck as ShieldOk,
  Home,
} from 'lucide-react';

const SERVICES = [
  // FMI / iCloud
  { id: 'fmi_onoff', name: 'iCloud FMI On/Off', price: 1.50, desc: 'Find My iPhone status', category: 'iCloud' },
  { id: 'icloud_cleanlost', name: 'iCloud Clean/Lost', price: 3.50, desc: 'iCloud lock + clean/lost status', category: 'iCloud' },
  { id: 'fmi_carrier', name: 'Carrier & FMI', price: 2.50, desc: 'Carrier + iCloud lock status', category: 'iCloud' },
  { id: 'fmi_carrier_bl', name: 'Carrier & FMI & Blacklist', price: 3.00, desc: 'Carrier + iCloud + blacklist', category: 'iCloud' },
  { id: 'mdm_status', name: 'MDM Status', price: 5.00, desc: 'Apple MDM lock check', category: 'iCloud' },
  { id: 'mdm_icloud_gsx', name: 'MDM & iCloud & GSX', price: 6.00, desc: 'Full MDM + iCloud + GSX report', category: 'iCloud' },
  // Apple GSX / Details
  { id: 'gsx_premium', name: 'GSX Premium Details', price: 4.00, desc: 'Full Apple GSX report', category: 'Apple GSX' },
  { id: 'apple_sold_by', name: 'Apple Sold By & Country', price: 3.50, desc: 'Sold by + country + warranty', category: 'Apple GSX' },
  { id: 'apple_basic', name: 'Apple Basic Info', price: 1.50, desc: 'Model + warranty + iCloud lock', category: 'Apple GSX' },
  { id: 'apple_activation', name: 'Apple Activation Status', price: 1.50, desc: 'Activation + warranty status', category: 'Apple GSX' },
  { id: 'apple_activation_pro', name: 'Apple Activation Pro', price: 2.00, desc: 'Detailed activation + lost mode', category: 'Apple GSX' },
  { id: 'apple_repair', name: 'GSX Repair Eligibility', price: 1.50, desc: 'Check repair eligibility + Chimaera', category: 'Apple GSX' },
  { id: 'apple_cases', name: 'GSX Cases & Repairs', price: 3.00, desc: 'Full repair history & cases', category: 'Apple GSX' },
  { id: 'apple_replacements', name: 'Replacements History', price: 1.50, desc: 'Device replacement history', category: 'Apple GSX' },
  // Carrier / SIM-Lock
  { id: 'iphone_carrier', name: 'iPhone Carrier Check', price: 1.50, desc: 'Locked carrier + SIM status', category: 'Carrier' },
  { id: 'iphone_simlock', name: 'iPhone SIM-Lock', price: 1.00, desc: 'SIM lock status only', category: 'Carrier' },
  { id: 'iphone_model_color', name: 'Model Color & Capacity', price: 0.80, desc: 'Model + color + capacity', category: 'Carrier' },
  { id: 'imei_sn_convert', name: 'IMEI ↔ SN Convert', price: 1.00, desc: 'Convert IMEI to serial number', category: 'Carrier' },
  // iPad / Mac
  { id: 'apple_ipad_mac', name: 'iPad/Mac Sold By', price: 3.50, desc: 'Sold by + warranty for iPad/Mac', category: 'iPad / Mac' },
  { id: 'macbook_icloud', name: 'MacBook iCloud Status', price: 3.00, desc: 'iCloud on/off for Mac/iPad', category: 'iPad / Mac' },
  // FMI OFF Compatibility
  { id: 'fmi_off_compatibility', name: 'FMI OFF Compatibility Check', price: 3.00, desc: 'Activation certificate + FMI OFF eligibility', category: 'FMI OFF' },
];

const TOPUP_AMOUNTS = [5, 10, 25, 50, 100];

export default function DashboardPage({ onBackToHome }: { onBackToHome?: () => void }) {
  const { user, signOut } = useAuth();
  const { profile, checks, transactions, loading, refresh } = useWallet();
  const [tab, setTab] = useState<'check' | 'history' | 'wallet'>('check');
  const [imei, setImei] = useState('');
  const [service, setService] = useState('fmi_onoff');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState(25);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [historyModal, setHistoryModal] = useState<any | null>(null);
  const [topupMethod, setTopupMethod] = useState<'mercadopago' | 'binance'>('mercadopago');

  // Check for payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setError(null);
      setTimeout(refresh, 1000);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [refresh]);

  const selectedService = SERVICES.find((s) => s.id === service)!;
  const balance = profile?.balance ?? 0;
  const canAfford = balance >= selectedService.price;

  const handleCheck = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCheckResult(null);
    setChecking(true);

    try {
      const apiUrl = '/.netlify/functions/imei-check';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imei, service, user_id: user!.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Check failed');
      } else {
        setCheckResult(data.result);
        setImei('');
        refresh();
      }
    } catch (err) {
      console.error('handleCheck error', err);
      setError('Network error. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleTopup = async () => {
    setTopupError(null);
    setTopupLoading(true);

    try {
      if (topupMethod === 'mercadopago') {
        const apiUrl = '/.netlify/functions/mercadopago?action=create';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: topupAmount, user_id: user!.id, email: user!.email, origin: window.location.origin }),
        });
        const data = await res.json();

        if (!res.ok) {
          setTopupError(data.error ?? 'Failed to create payment');
        } else if (data.init_point || data.sandbox_init_point) {
          window.location.href = data.sandbox_init_point ?? data.init_point;
        } else {
          setTopupError('No payment URL returned');
        }
      } else if (topupMethod === 'binance') {
        const apiUrl = '/.netlify/functions/binance-create-order';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: topupAmount, user_id: user!.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setTopupError(data.error ?? 'Failed to create Binance order');
        } else {
          alert('Orden creada. Revisa las instrucciones de pago en la wallet.');
          refresh();
        }
      }
    } catch (err) {
      console.error('handleTopup error', err);
      setTopupError('Network error. Please try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-8 w-8 animate-spin text-neon-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-size opacity-20" />

      {/* top bar */}
      <header className="glass sticky top-0 z-40 border-b border-ink-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-500/30 bg-ink-800">
              <ShieldCheck className="h-5 w-5 text-neon-500" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">iCheckerPro</span>
            <span className="ml-2 rounded-full border border-ink-700 px-2.5 py-0.5 text-xs text-muted">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-xl border border-ink-700 bg-ink-800 px-4 py-2 sm:flex">
              <Wallet className="h-4 w-4 text-neon-500" />
              <span className="text-sm font-semibold">${balance.toFixed(2)}</span>
            </div>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-sm text-muted transition-colors hover:border-neon-500/40 hover:text-neon-500"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-sm text-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        {/* mobile balance */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3 sm:hidden">
          <Wallet className="h-4 w-4 text-neon-500" />
          <span className="text-sm font-semibold">Balance: ${balance.toFixed(2)}</span>
        </div>

        {/* tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-ink-900 p-1.5">
          {[
            { id: 'check' as const, label: 'IMEI Check', icon: Smartphone },
            { id: 'history' as const, label: 'History', icon: History },
            { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                tab === t.id ? 'bg-neon-500 text-ink-950' : 'text-muted hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── IMEI Check Tab ───────────────────────────────────── */}
        {tab === 'check' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* check form */}
            <div className="card-base">
              <h2 className="mb-1 font-display text-xl font-bold">New IMEI Check</h2>
              <p className="mb-6 text-sm text-muted">Enter your IMEI and select a service.</p>

              <form onSubmit={handleCheck} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted">IMEI (15 digits) or Serial Number</label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 15))}
                    placeholder="e.g. 353012109012345 or DNPV506UH0J"
                    required
                    className="input-field font-mono tracking-wider"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-muted">Service</label>
                  <div className="max-h-[340px] space-y-4 overflow-y-auto scrollbar-hide pr-1">
                    {Object.entries(
                      SERVICES.reduce((acc, s) => {
                        (acc[s.category] ??= []).push(s);
                        return acc;
                      }, {} as Record<string, typeof SERVICES>),
                    ).map(([category, services]) => (
                      <div key={category}>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted/60">{category}</p>
                        <div className="space-y-2">
                          {services.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setService(s.id)}
                              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                                service === s.id
                                  ? 'border-neon-500/40 bg-neon-500/5 shadow-glow-sm'
                                  : 'border-ink-700 bg-ink-900 hover:border-ink-600'
                              }`}
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{s.name}</p>
                                <p className="text-xs text-muted">{s.desc}</p>
                              </div>
                              <span className="font-display text-base font-bold text-neon-500">${s.price.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 px-4 py-3">
                  <span className="text-sm text-muted">Your balance</span>
                  <span className={`font-display font-bold ${canAfford ? 'text-neon-500' : 'text-danger'}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={checking || !canAfford}
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
                >
                  {checking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Check Now (${selectedService.price})
                    </>
                  )}
                </button>

                {!canAfford && (
                  <p className="text-center text-xs text-danger">
                    Insufficient balance. Top up your wallet to continue.
                  </p>
                )}
              </form>
            </div>

            {/* result */}
            <div className="card-base">
              <h2 className="mb-1 font-display text-xl font-bold">Result</h2>
              <p className="mb-6 text-sm text-muted">Check results will appear here.</p>

              {checkResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-neon-500/30 bg-neon-500/5 p-4">
                    <CheckCircle2 className="h-6 w-6 text-neon-500" />
                    <div>
                      <p className="font-display text-sm font-semibold">Check Completed</p>
                      <p className="text-xs text-muted">IMEI: {checkResult.imei ?? 'N/A'}</p>
                    </div>
                  </div>

                  {/* Compatibility verdict (for fmi_off_compatibility) */}
                  {checkResult.compatibility && (
                    <div className={`rounded-xl border p-4 ${
                      checkResult.compatibility.eligible
                        ? 'border-neon-500/30 bg-neon-500/5'
                        : 'border-danger/30 bg-danger/5'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {checkResult.compatibility.eligible
                          ? <ShieldOk className="h-5 w-5 text-neon-500" />
                          : <ShieldAlert className="h-5 w-5 text-danger" />
                        }
                        <span className={`font-display text-sm font-bold ${
                          checkResult.compatibility.eligible ? 'text-neon-500' : 'text-danger'
                        }`}>
                          {checkResult.compatibility.verdict}
                        </span>
                      </div>

                      {checkResult.compatibility.activation_certificate && (
                        <div className="mt-3 rounded-lg border border-ink-700 bg-ink-900 p-4">
                          <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                            Activation Certificate
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Certificate ID</span>
                              <span className="font-mono text-white">
                                {checkResult.compatibility.activation_certificate.certificate_id}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Status</span>
                              <span className={`font-medium ${
                                checkResult.compatibility.activation_certificate.status === 'Valid'
                                  ? 'text-neon-500' : 'text-danger'
                              }`}>
                                {checkResult.compatibility.activation_certificate.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Issue Date</span>
                              <span className="text-white">
                                {checkResult.compatibility.activation_certificate.issue_date}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Expiry Date</span>
                              <span className="text-white">
                                {checkResult.compatibility.activation_certificate.expiry_date}
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-muted">
                            {checkResult.compatibility.activation_certificate.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <SickwResult result={checkResult} />
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted">
                  <Smartphone className="h-12 w-12 opacity-30" />
                  <p className="text-sm">No results yet. Submit an IMEI to check.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── History Tab ─────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-6">
            <div className="card-base">
              <h2 className="mb-4 font-display text-xl font-bold">IMEI Check History</h2>
              {checks.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted">
                  <History className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No checks yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checks.map((c) => {
                    const svc = SERVICES.find((s) => s.id === c.service);
                    const isCompat = c.service === 'fmi_off_compatibility';
                    let fmiStatus = 'N/A';
                    let compatVerdict = '';
                    if (c.result) {
                      if (isCompat && c.result.compatibility) {
                        fmiStatus = c.result.result?.['Find My iPhone'] ?? 'N/A';
                        compatVerdict = c.result.compatibility.eligible ? 'Compatible' : 'Not Compatible';
                      } else if (c.result.result) {
                        fmiStatus = c.result.result['Find My iPhone'] ?? c.result.result['FMI'] ?? 'N/A';
                      }
                    }
                    return (
                      <button
                        key={c.id}
                        onClick={() => c.result && setHistoryModal(c)}
                        className={`flex w-full items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-4 text-left transition ${
                          c.result ? 'hover:border-neon-500/30 hover:bg-ink-800 cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            c.status === 'completed' ? 'bg-neon-500/10' : 'bg-ink-800'
                          }`}>
                            {c.status === 'completed' ? (
                              isCompat ? (
                                compatVerdict === 'Compatible'
                                  ? <ShieldOk className="h-5 w-5 text-neon-500" />
                                  : <ShieldAlert className="h-5 w-5 text-danger" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-neon-500" />
                              )
                            ) : c.status === 'failed' ? (
                              <XCircle className="h-5 w-5 text-danger" />
                            ) : (
                              <Clock className="h-5 w-5 text-muted" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium text-white">{c.imei}</p>
                            <p className="text-xs text-muted">
                              {svc?.name ?? c.service} · ${c.price}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                          {isCompat && compatVerdict ? (
                            <p className={`text-xs font-medium ${compatVerdict === 'Compatible' ? 'text-neon-500' : 'text-danger'}`}>
                              {compatVerdict}
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-neon-500">
                              FMI: {fmiStatus}
                            </p>
                          )}
                          {c.result && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted">
                              <ExternalLink className="h-3 w-3" /> View details
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-base">
              <h2 className="mb-4 font-display text-xl font-bold">Transaction History</h2>
              {transactions.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted">
                  <CreditCard className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No transactions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          t.type === 'topup' ? 'bg-neon-500/10' : 'bg-ink-800'
                        }`}>
                          {t.type === 'topup' ? (
                            <ArrowDownCircle className="h-5 w-5 text-neon-500" />
                          ) : (
                            <Smartphone className="h-5 w-5 text-muted" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize text-white">
                            {t.type === 'topup' ? 'Wallet Top-up' : 'IMEI Check'}
                          </p>
                          <p className="text-xs text-muted">
                            {t.provider} · {new Date(t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-sm font-bold ${
                          t.type === 'topup' ? 'text-neon-500' : 'text-white'
                        }`}>
                          {t.type === 'topup' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                        </p>
                        <p className={`text-xs capitalize ${
                          t.status === 'completed' ? 'text-neon-600' :
                          t.status === 'pending' ? 'text-muted' : 'text-danger'
                        }`}>
                          {t.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Wallet Tab ──────────────────────────────────────── */}
        {tab === 'wallet' && (
          <div className="mx-auto max-w-lg space-y-6">
            {/* balance card */}
            <div className="card-base relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-[60px]" style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }} />
              <div className="relative">
                <p className="text-sm text-muted">Current Balance</p>
                <p className="mt-2 font-display text-5xl font-bold text-neon-500">
                  ${balance.toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-muted">{user?.email}</p>
              </div>
            </div>

            {/* topup card */}
            <div className="card-base">
              <h2 className="mb-1 font-display text-xl font-bold">Top Up Balance</h2>
              <p className="mb-6 text-sm text-muted">Add funds via MercadoPago (credit card, debit, or transfer) or Binance transfer.</p>

              {topupError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{topupError}</span>
                </div>
              )}

              <div className="mb-5 grid grid-cols-5 gap-2">
                {TOPUP_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopupAmount(amt)}
                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                      topupAmount === amt
                        ? 'border-neon-500/40 bg-neon-500/5 text-neon-500 shadow-glow-sm'
                        : 'border-ink-700 bg-ink-900 text-muted hover:text-white'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-xs font-medium text-muted">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    type="number"
                    min={1}
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Math.max(1, Number(e.target.value)))}
                    className="input-field pl-8"
                  />
                </div>
              </div>

              {/* method selector */}
              <div className="mb-4 flex gap-2">
                <button onClick={() => setTopupMethod('mercadopago')} className={`rounded-xl px-3 py-2 ${topupMethod==='mercadopago' ? 'bg-neon-500 text-ink-950' : 'bg-ink-900 text-muted border border-ink-700'}`}>
                  MercadoPago
                </button>
                <button onClick={() => setTopupMethod('binance')} className={`rounded-xl px-3 py-2 ${topupMethod==='binance' ? 'bg-neon-500 text-ink-950' : 'bg-ink-900 text-muted border border-ink-700'}`}>
                  Binance Transfer
                </button>
              </div>

              <button
                onClick={handleTopup}
                disabled={topupLoading}
                className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
              >
                {topupLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {topupMethod === 'mercadopago' ? `Pay $${topupAmount} with MercadoPago` : `Create Binance payment instructions for $${topupAmount}`}
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                <ExternalLink className="h-3 w-3" />
                You'll be redirected to MercadoPago's secure checkout (when selected) or shown Binance instructions.
              </p>
            </div>

            {/* Binance payment instructions card (rendered when user created a Binance order) */}
            <div className="card-base">
              <h2 className="mb-1 font-display text-xl font-bold">Pay with Binance</h2>
              <p className="mb-4 text-sm text-muted">If you choose Binance Transfer, we'll create an order and verify the payment when you click Verify.</p>
              <WalletBinancePay userId={user!.id} amount={topupAmount} />
            </div>
          </div>
        )}

        {/* History detail modal */}
        {historyModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setHistoryModal(null)}
          >
            <div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-ink-700 bg-ink-950 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Check Details</h3>
                  <p className="font-mono text-sm text-muted">{historyModal.imei}</p>
                </div>
                <button
                  onClick={() => setHistoryModal(null)}
                  className="rounded-lg p-2 text-muted hover:bg-ink-800 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                  <span className="text-xs text-muted">Service: </span>
                  <span className="text-xs font-medium text-white">
                    {SERVICES.find((s) => s.id === historyModal.service)?.name ?? historyModal.service}
                  </span>
                </div>
                <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                  <span className="text-xs text-muted">Price: </span>
                  <span className="text-xs font-medium text-white">${historyModal.price}</span>
                </div>
                <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                  <span className="text-xs text-muted">Date: </span>
                  <span className="text-xs font-medium text-white">
                    {new Date(historyModal.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                  <span className="text-xs text-muted">Status: </span>
                  <span className={`text-xs font-medium ${
                    historyModal.status === 'completed' ? 'text-neon-500' :
                    historyModal.status === 'failed' ? 'text-danger' : 'text-muted'
                  }`}>
                    {historyModal.status}
                  </span>
                </div>
              </div>

              {/* Compatibility verdict (for fmi_off_compatibility) */}
              {historyModal.service === 'fmi_off_compatibility' && historyModal.result?.compatibility && (
                <div className={`mb-4 rounded-xl border p-4 ${
                  historyModal.result.compatibility.eligible
                    ? 'border-neon-500/30 bg-neon-500/5'
                    : 'border-danger/30 bg-danger/5'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {historyModal.result.compatibility.eligible
                      ? <ShieldOk className="h-5 w-5 text-neon-500" />
                      : <ShieldAlert className="h-5 w-5 text-danger" />
                    }
                    <span className={`font-display text-sm font-bold ${
                      historyModal.result.compatibility.eligible ? 'text-neon-500' : 'text-danger'
                    }`}>
                      {historyModal.result.compatibility.verdict}
                    </span>
                  </div>

                  {/* Activation certificate */}
                  {historyModal.result.compatibility.activation_certificate && (
                    <div className="mt-3 rounded-lg border border-ink-700 bg-ink-900 p-4">
                      <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                        Activation Certificate
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Certificate ID</span>
                          <span className="font-mono text-white">
                            {historyModal.result.compatibility.activation_certificate.certificate_id}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Status</span>
                          <span className={`font-medium ${
                            historyModal.result.compatibility.activation_certificate.status === 'Valid'
                              ? 'text-neon-500' : 'text-danger'
                          }`}>
                            {historyModal.result.compatibility.activation_certificate.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Issue Date</span>
                          <span className="text-white">
                            {historyModal.result.compatibility.activation_certificate.issue_date}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted">Expiry Date</span>
                          <span className="text-white">
                            {historyModal.result.compatibility.activation_certificate.expiry_date}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted">
                        {historyModal.result.compatibility.activation_certificate.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Raw sickw result */}
              <div className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                API Response
              </div>
              <SickwResult result={historyModal.result} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
