import { useState, FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
  const result = mode === 'signin'
    ? { ...(await signIn(email, password)), needsConfirmation: false }
    : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup' && result.needsConfirmation) {
      setSuccess('Account created! You can now sign in.');
      setMode('signin');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      {/* background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px]" style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-size opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-500/30 bg-ink-800 shadow-glow-sm">
            <ShieldCheck className="h-8 w-8 text-neon-500" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">iCheckerPro</h1>
          <p className="text-sm text-muted">Premium iPhone IMEI Checking & Unlocking Service</p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="absolute -top-2 left-0 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        )}

        <div className="card-base glass">
          {/* tabs */}
          <div className="mb-6 flex rounded-xl bg-ink-900 p-1">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === 'signin' ? 'bg-neon-500 text-ink-950' : 'text-muted hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${mode === 'signup' ? 'bg-neon-500 text-ink-950' : 'text-muted hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-muted">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-muted">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-neon-500/30 bg-neon-500/5 px-4 py-3 text-sm text-neon-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="font-medium text-neon-500 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/60">
          By signing in you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
