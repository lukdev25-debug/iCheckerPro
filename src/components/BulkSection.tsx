import Reveal from '../components/Reveal';
import AnimatedCounter from '../components/AnimatedCounter';
import { Package, TrendingDown, Building2, ArrowRight } from 'lucide-react';

export default function BulkSection({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    { icon: Package, title: 'Volume Pricing', desc: 'Discounts starting at 50+ devices with tiered pricing.' },
    { icon: TrendingDown, title: 'Lower Cost Per Unit', desc: 'Save up to 40% compared to individual orders.' },
    { icon: Building2, title: 'Business Accounts', desc: 'Dedicated support and priority processing for resellers.' },
  ];

  return (
    <section id="bulk" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="card-base relative overflow-hidden">
          {/* glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px]" style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }} />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Reveal>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon-500/20 bg-neon-500/5 px-4 py-1.5 text-xs font-medium text-neon-500">
                  Bulk Orders (50+ Devices)
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Bulk Orders,
                  <br />
                  <span className="text-neon-500">Bigger Savings</span>
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-4 max-w-md text-muted">
                  Resellers and businesses can unlock significant discounts on volume orders.
                  Perfect for repair shops, wholesalers, and service providers.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div>
                    <AnimatedCounter target={40} suffix="%" className="font-display text-2xl font-bold text-neon-500" />
                    <p className="text-xs text-muted">Max Discount</p>
                  </div>
                  <div>
                    <AnimatedCounter target={50} suffix="+" className="font-display text-2xl font-bold text-neon-500" />
                    <p className="text-xs text-muted">Min Devices</p>
                  </div>
                  <div>
                    <AnimatedCounter target={24} suffix="h" className="font-display text-2xl font-bold text-neon-500" />
                    <p className="text-xs text-muted">Priority SLA</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <button onClick={onGetStarted} className="btn-primary mt-8 flex items-center gap-2">
                  Request Bulk Quote
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Reveal>
            </div>

            <div className="space-y-4">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 100}>
                  <div className="flex items-start gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neon-500/20 bg-neon-500/5">
                      <f.icon className="h-5 w-5 text-neon-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
