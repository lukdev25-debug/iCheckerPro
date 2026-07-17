import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-700 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-500/30 bg-ink-800">
            <ShieldCheck className="h-4 w-4 text-neon-500" />
          </div>
          <span className="font-display text-sm font-bold">iCheckerPro</span>
        </div>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} iCheckerPro. All rights reserved. Premium iPhone IMEI Checking & Unlocking Service.
        </p>

        <div className="flex gap-6 text-xs text-muted">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
