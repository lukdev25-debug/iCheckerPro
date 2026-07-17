import { useEffect, useState } from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';

const links = [
  { label: 'Models', href: '#models' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Bulk', href: '#bulk' },
  { label: 'Why Us', href: '#why' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ onGetStarted, isLoggedIn }: { onGetStarted: () => void; isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'glass border-b border-ink-700' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-500/30 bg-ink-800">
            <ShieldCheck className="h-5 w-5 text-neon-500" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">iCheckerPro</span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <button onClick={onGetStarted} className="btn-primary text-sm">
            {isLoggedIn ? 'Dashboard' : 'Start Order'}
          </button>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="glass border-t border-ink-700 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => { setOpen(false); onGetStarted(); }}
              className="btn-primary mt-2 text-center text-sm"
            >
              {isLoggedIn ? 'Dashboard' : 'Start Order'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
