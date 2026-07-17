import { useState } from 'react';
import Reveal from '../components/Reveal';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is iCheckerPro?',
    a: 'iCheckerPro is a premium IMEI checking and iCloud unlocking platform. We provide real-time IMEI diagnostics, Find My iPhone status verification, carrier checks, blacklist lookups, and permanent iCloud Activation Lock removal — all powered by official, legitimate API sources.',
  },
  {
    q: 'What is an IMEI check and what is it for?',
    a: 'An IMEI check retrieves detailed information about a device using its 15-digit IMEI or serial number. This includes model, warranty status, carrier lock, blacklist status, iCloud/Find My iPhone status, and more. It is essential before purchasing a used device or requesting an unlock service, as it reveals whether the phone is blocked, blacklisted, or linked to an iCloud account.',
  },
  {
    q: 'What is the FMI OFF Compatibility Check (root check)?',
    a: 'The FMI OFF Compatibility Check — also known as a "root check" — is a specialized diagnostic that determines whether your device is eligible for the iCloud Activation Lock removal (FMI OFF). It verifies the status of the device\'s activation certificate, checks if Find My iPhone is ON or OFF, and confirms whether the device can be unlinked from the previous owner\'s iCloud account. This check is required before performing any FMI OFF removal.',
  },
  {
    q: 'What does the activation certificate tell me?',
    a: 'The activation certificate is issued by Apple\'s activation servers when a device is set up. If the certificate is valid and Find My iPhone is OFF, the device is compatible and eligible for FMI OFF removal. If the certificate has expired or Find My iPhone is ON, the device is not compatible — the activation lock is still active and prevents the device from being unlinked from the previous owner\'s iCloud account. In that case, Find My iPhone must be turned OFF before the FMI OFF service can be applied.',
  },
  {
    q: 'What does it mean to "desvincular" (unlink) an iCloud account?',
    a: 'Desvincular means removing the link between a device and the previous owner\'s iCloud account. This is only possible when Find My iPhone is OFF and the activation certificate is valid. Once unlinked, the device can be set up as new with any Apple ID, without needing the original owner\'s credentials.',
  },
  {
    q: 'Are the IMEI checks legitimate?',
    a: 'Yes. All our IMEI checks are performed using official, authorized API providers with direct access to Apple\'s GSX database, carrier databases, and global blacklist registries. The results are real, accurate, and verifiable. We do not use unofficial or hacked databases.',
  },
  {
    q: 'Is the unlock permanent?',
    a: 'Yes. Our iCloud activation lock removal service provides a permanent, factory-grade solution. Once unlocked, the device will not re-lock after updates or factory resets.',
  },
  {
    q: 'How long does it take?',
    a: 'IMEI checks are typically completed within seconds to a few minutes. The FMI OFF Compatibility Check returns results instantly. Premium FMI OFF unlocks take 24–72 hours depending on the model and carrier.',
  },
  {
    q: 'Which iPhone models are supported?',
    a: 'We support all iPhone models from iPhone 6s through iPhone 15 Pro Max, across all carriers and regions worldwide.',
  },
  {
    q: 'What happens if the unlock fails?',
    a: 'We offer a full money-back guarantee. If we cannot unlock your device, you receive a complete refund with no questions asked.',
  },
  {
    q: 'Do you offer bulk discounts?',
    a: 'Yes. For orders of 50+ devices, we offer tiered volume discounts of up to 40% off. Contact us for a custom bulk quote.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. All IMEI numbers are encrypted in transit and automatically deleted from our systems after the service is completed.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept MercadoPago (credit card, debit, bank transfer) and wallet balance. You can top up your balance and use it for instant checks.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">FAQ</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Everything you need to know about our service.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <div
                className={`card-base cursor-pointer ${open === i ? 'border-neon-500/30' : ''}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-base font-semibold">{faq.q}</h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-neon-500 transition-transform duration-300 ${
                      open === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ${
                    open === i ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-muted">{faq.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
