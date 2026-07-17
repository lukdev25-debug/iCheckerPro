import Reveal from '../components/Reveal';
import { ShieldCheck, Zap, Lock, Headphones, RefreshCw, Globe } from 'lucide-react';

const reasons = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Most checks complete in under 24 hours. Premium unlocks in 24–72 hours.' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your data is encrypted. We never store IMEI numbers longer than needed.' },
  { icon: Lock, title: 'Permanent Unlock', desc: 'Our iCloud activation lock removal service provides a permanent, factory-grade solution.' },
  { icon: RefreshCw, title: 'Money-Back Guarantee', desc: 'If we can\'t unlock your device, you get a full refund. No questions asked.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team available around the clock via WhatsApp and email.' },
  { icon: Globe, title: 'Worldwide Service', desc: 'We work with all carriers and regions globally. No restrictions.' },
];

export default function WhyUsSection() {
  return (
    <section id="why" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Why Choose Us</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              We combine speed, security, and reliability to deliver the best unlocking experience.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <div className="card-base group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neon-500/20 bg-neon-500/5 transition-all group-hover:border-neon-500/40 group-hover:shadow-glow-sm">
                  <r.icon className="h-6 w-6 text-neon-500" />
                </div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
