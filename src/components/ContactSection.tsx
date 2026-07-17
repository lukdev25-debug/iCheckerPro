import Reveal from '../components/Reveal';
import { MessageCircle, Mail, Send } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="card-base relative overflow-hidden text-center">
            {/* glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #66FF33 0%, transparent 70%)' }} />

            <div className="relative">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Get In Touch
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted">
                Have questions? Our team is available 24/7. Reach out via WhatsApp for the fastest response.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </a>
                <a href="mailto:support@fmioff.com" className="btn-secondary flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Support
                </a>
              </div>

              <div className="mt-10 flex flex-col items-center gap-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-neon-500" />
                  <span>Average response time: under 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
