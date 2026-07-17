import Reveal from '../components/Reveal';
import { Smartphone, Check } from 'lucide-react';

const models = [
  { name: 'iPhone 15 Pro Max', year: '2023', supported: true },
  { name: 'iPhone 15 Pro', year: '2023', supported: true },
  { name: 'iPhone 15 Plus', year: '2023', supported: true },
  { name: 'iPhone 15', year: '2023', supported: true },
  { name: 'iPhone 14 Pro Max', year: '2022', supported: true },
  { name: 'iPhone 14 Pro', year: '2022', supported: true },
  { name: 'iPhone 14 Plus', year: '2022', supported: true },
  { name: 'iPhone 14', year: '2022', supported: true },
  { name: 'iPhone 13 Pro Max', year: '2021', supported: true },
  { name: 'iPhone 13 Pro', year: '2021', supported: true },
  { name: 'iPhone 13', year: '2021', supported: true },
  { name: 'iPhone 12 Pro Max', year: '2020', supported: true },
  { name: 'iPhone 12 Pro', year: '2020', supported: true },
  { name: 'iPhone 12', year: '2020', supported: true },
  { name: 'iPhone 11 Pro Max', year: '2019', supported: true },
  { name: 'iPhone 11', year: '2019', supported: true },
  { name: 'iPhone XS Max', year: '2018', supported: true },
  { name: 'iPhone XR', year: '2018', supported: true },
  { name: 'iPhone X', year: '2017', supported: true },
  { name: 'iPhone 8 / 8+', year: '2017', supported: true },
  { name: 'iPhone 7 / 7+', year: '2016', supported: true },
  { name: 'iPhone 6s / 6s+', year: '2015', supported: true },
];

export default function ModelsSection() {
  return (
    <section id="models" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Supported Models</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              We support every iPhone model from the iPhone 6s to the latest iPhone 15 Pro Max.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {models.map((m, i) => (
            <Reveal key={m.name} delay={i * 30}>
              <div className="card-base flex flex-col items-center gap-2 text-center !p-4">
                <Smartphone className="h-6 w-6 text-neon-500" />
                <p className="text-sm font-medium text-white">{m.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Check className="h-3 w-3 text-neon-600" />
                  {m.year}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
