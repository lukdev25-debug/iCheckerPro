import Reveal from '../components/Reveal';
import { Check, Zap, Clock, Star } from 'lucide-react';

const plans = [
  {
    name: 'iCloud FMI Check',
    price: '$1.50',
    unit: 'per IMEI',
    icon: Clock,
    features: [
      'Find My iPhone On/Off',
      'iCloud Activation Lock Status',
      'Instant Results',
      'All iPhone Models',
      'Delivery: Seconds',
    ],
    highlighted: false,
  },
  {
    name: 'GSX Premium Report',
    price: '$4.00',
    unit: 'per IMEI',
    icon: Zap,
    features: [
      'Full Apple GSX Report',
      'iCloud Lock + MDM Status',
      'Carrier & SIM-Lock Info',
      'Warranty & Purchase Date',
      'Activation Policy Details',
      'Replacement History',
    ],
    highlighted: true,
  },
  {
    name: 'Carrier & FMI + Blacklist',
    price: '$3.00',
    unit: 'per IMEI',
    icon: Star,
    features: [
      'Carrier Identification',
      'iCloud Lock Status',
      'Blacklist Status',
      'SIM-Lock Status',
      'Delivery: Instant',
    ],
    highlighted: false,
  },
];

export default function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="pricing" className="relative py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05] blur-[120px]" style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Price List</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Transparent pricing. No hidden fees. Pay only for what you need.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div
                className={`card-base relative flex flex-col ${
                  plan.highlighted ? 'border-neon-500/40 shadow-glow-sm' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neon-500 px-4 py-1 text-xs font-semibold text-ink-950">
                    Most Popular
                  </div>
                )}

                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${plan.highlighted ? 'border-neon-500/30 bg-neon-500/5' : 'border-ink-700 bg-ink-900'}`}>
                    <plan.icon className="h-5 w-5 text-neon-500" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted">{plan.unit}</span>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <Check className="h-4 w-4 shrink-0 text-neon-600" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`mt-auto ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
