import Reveal from './Reveal';
import { ArrowRight } from 'lucide-react';

export default function RootCheckSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-size opacity-30" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          {/* poster */}
          <Reveal className="w-full max-w-sm shrink-0 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-ink-700 shadow-dark">
              <img
                src="/images/PublicidadFMIoff.png"
                alt="FMI OFF Compatibility Check pricing — $19 USD"
                className="w-full object-cover"
                draggable={false}
              />
            </div>
          </Reveal>

          {/* copy */}
          <Reveal delay={100} className="flex-1">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-500/20 bg-neon-500/5 px-4 py-1.5 text-xs font-medium text-neon-500">
                Root Check / Check de Raiz
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                FMI OFF Compatibility Check
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                Before requesting an FMI OFF service, run this essential diagnostic first.
                It verifies the device's <strong className="text-white">activation certificate</strong>,
                confirms whether <strong className="text-white">Find My iPhone is ON or OFF</strong>,
                and determines if the device can be unlinked from the previous iCloud account.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Activation Certificate Validation', desc: 'Confirms whether Apple\'s activation certificate is valid and the device is eligible for FMI OFF.' },
                  { title: 'iCloud Account Link Status', desc: 'Determines if the device is still linked to a previous owner\'s iCloud and whether it can be unlinked.' },
                  { title: 'Find My iPhone Status', desc: 'Real-time FMI ON / FMI OFF status directly from Apple\'s servers.' },
                  { title: 'All Models Supported', desc: 'Compatible with iPhone 6s through iPhone 15 Pro Max, all carriers and regions.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon-500/10 text-neon-500">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 pt-2">
                <div className="rounded-xl border border-neon-500/30 bg-neon-500/5 px-6 py-4 text-center">
                  <p className="font-display text-3xl font-extrabold text-neon-500">$19</p>
                  <p className="text-xs text-muted">USD — One-time check</p>
                </div>
                <button
                  onClick={onGetStarted}
                  className="btn-primary flex items-center gap-2"
                >
                  Run Compatibility Check
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
