import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import Reveal from '../components/Reveal';

const banners = [
  { src: '/images/BannerWEb.png', alt: 'iCheckerPro — Premium IMEI Checking & Unlocking' },
  { src: '/images/Bannerweb2.png', alt: 'iPhone IMEI Checks' },
];

const AUTOPLAY_MS = 5000;

export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  const [current, setCurrent] = useState(0);
  const hasMultiple = banners.length > 1;

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + banners.length) % banners.length), []);

  useEffect(() => {
    if (!hasMultiple) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hasMultiple, next]);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      {/* background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-size opacity-40" />
      {/* radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.08] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* badge + copy */}
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-500/20 bg-neon-500/5 px-4 py-1.5 text-xs font-medium text-neon-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-500" />
              </span>
              All Models Supported — Instant Processing
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-balance md:text-6xl">
              iCheckerPro —&nbsp;
              <span className="bg-gradient-to-r from-neon-500 to-neon-600 bg-clip-text text-transparent">
                ALL MODELS
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted text-balance">
              Premium iCloud activation lock removal and IMEI checking service.
              Fast, secure, and trusted by thousands. Processed in minutes, not days.
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <button onClick={onGetStarted} className="btn-primary flex items-center gap-2 text-base">
                Start Order
                <ArrowRight className="h-5 w-5" />
              </button>
              <a href="#pricing" className="btn-secondary text-base">
                View Pricing
              </a>
            </div>
          </div>
        </Reveal>

        

        {/* stats */}
        <Reveal delay={200}>
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6 text-center">
            <div>
              <AnimatedCounter target={10000} suffix="+" className="font-display text-3xl font-bold text-white" />
              <p className="mt-1 text-xs text-muted">Devices Processed</p>
            </div>
            <div>
              <AnimatedCounter target={99} suffix="%" className="font-display text-3xl font-bold text-white" />
              <p className="mt-1 text-xs text-muted">Success Rate</p>
            </div>
            <div>
              <AnimatedCounter target={24} suffix="h" className="font-display text-3xl font-bold text-white" />
              <p className="mt-1 text-xs text-muted">Avg. Delivery</p>
            </div>
          </div>
        </Reveal>

        {/* banner carousel */}
        <Reveal delay={150}>
          <div className="relative mx-auto mt-10 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-ink-700 shadow-dark">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {banners.map((b, i) => (
                  <div key={i} className="w-full shrink-0">
                    <img
                      src={b.src}
                      alt={b.alt}
                      className="w-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-900/80 p-2 text-white backdrop-blur transition hover:bg-ink-800 hover:text-neon-500"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-900/80 p-2 text-white backdrop-blur transition hover:bg-ink-800 hover:text-neon-500"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* dots */}
                <div className="mt-4 flex justify-center gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === current ? 'w-6 bg-neon-500' : 'w-2 bg-ink-600 hover:bg-ink-500'
                      }`}
                      aria-label={`Go to banner ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </Reveal>
      
      </div>
    </section>
  );
}
