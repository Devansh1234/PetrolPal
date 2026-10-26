import Image from 'next/image';
import Link from 'next/link';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';
import ProductCard from '@/components/get/ProductCard';
import EngineeringStory from '@/components/get/EngineeringStory';
import { E20Column, PermittivityBars, CombField, StepFill, StepDip, StepRead } from '@/components/get/Graphics';

export const metadata = {
  title: 'Get Petrol Pal — know what’s in your tank',
  description:
    'Petrol Pal is a pocket tester that measures the ethanol in your petrol at the pump. Join the waitlist for the early-bird price: Go ₹1,200, Pro ₹2,500.',
  openGraph: {
    title: 'Petrol Pal — know what’s in your tank',
    description: 'A pocket tester that measures the ethanol in your petrol, right at the pump. Early-bird prices for the waitlist.',
    images: [{ url: '/get/og.jpg', width: 1200, height: 630 }],
  },
};

const PRICES = {
  go: { price: '₹1,850', early: '₹1,200' },
  pro: { price: '₹3,250', early: '₹2,500' },
};

const SPECS = [
  ['What it tells you', 'Three lights: green good, white unclear, red check', 'Ethanol % on screen, against the E20 band'],
  ['Measuring range', 'Around the E20 band', '0–40 % ethanol'],
  ['Resolution', '—', '0.1 %'],
  ['Accuracy', '±2 % ethanol', '±1 % ethanol'],
  ['Time to result', 'Under 10 seconds', 'Under 10 seconds'],
  ['Temperature correction', '10–50 °C, sensor in the fuel', '10–50 °C, sensor in the fuel'],
  ['Sensor', 'Gold interdigitated electrode, 40 × 20 mm', 'Gold interdigitated electrode, 40 × 20 mm'],
  ['Sample', 'About 5 ml in the clear cap', 'About 5 ml in the clear cap'],
  ['Adds tests to the map', 'No', 'Yes, by QR code'],
  ['Bluetooth', 'No', 'Bluetooth LE'],
  ['Power', 'Two AAA cells · ~3,000 tests', 'Two AAA cells · ~1,200 tests'],
  ['Size (body)', '34 × 98 × 15 mm', '38 × 118 × 18 mm'],
  ['Length with paddle', '150 mm', '176 mm'],
  ['Weight with cells', '~60 g', '~80 g'],
  ['Splash resistance', 'IP54', 'IP54'],
  ['Colours', 'White, Black', 'Black, White'],
];

const FAQ = [
  ['When can I buy one?', 'We’re finishing the design and testing prototypes now. Everyone on the waitlist hears first when orders open.'],
  [
    'How does the early-bird price work?',
    'Join the waitlist now. When orders open, you’ll be offered the early-bird price — ₹1,200 for Go or ₹2,500 for Pro — for your first device. There’s nothing to pay until then, and no obligation to buy.',
  ],
  ['Is this a lab test?', 'No. Petrol Pal is a consumer device that gives you a quick indication at the pump. It isn’t a certified laboratory test.'],
  ['What does it measure?', 'The share of ethanol in petrol. It doesn’t test for other substances, but an unusual reading is a sign worth checking.'],
  ['Why are the specifications “targets”?', 'Petrol Pal is still in development. The numbers on this page are what we are designing towards; we’ll publish confirmed figures once testing is done.'],
  ['What batteries does it use?', 'Two standard AAA cells, available everywhere. There is nothing to charge.'],
  ['Do I need the app or an account?', 'No. Go works on its own. With Pro, you can scan its QR code to add a test to the public map — no app or account needed.'],
];

function Eyebrow({ children, dark }) {
  return <span className={`font-mono text-xs font-medium uppercase tracking-[0.16em] ${dark ? 'text-teal-300' : 'text-pal-700'}`}>{children}</span>;
}

export default function GetPage() {
  return (
    <>
      <main className="flex flex-col">
        {/* 1 — Hero */}
        <section aria-labelledby="hero-h" className="relative overflow-hidden bg-[#0E1214] text-white">
          <div className="mx-auto grid max-w-[1180px] items-center gap-6 px-5 pb-16 pt-12 md:grid-cols-[1.05fr_1fr] md:px-8 md:pb-20 md:pt-16">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-200">Coming soon</span>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-stone-400">Petrol Pal Go · Petrol Pal Pro</span>
              </div>
              <h1 id="hero-h" className="text-[44px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Know what’s in your tank.
              </h1>
              <p className="max-w-[46ch] text-lg text-stone-300">
                A pocket tester that measures the ethanol in your petrol, right at the pump. Fill the cap, dip, and read the answer in seconds.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#waitlist" className="btn-primary bg-teal-500 px-6 text-base text-[#04201D] hover:bg-teal-400 hover:text-[#04201D]">
                  Join the waitlist
                </a>
                <a href="#engineering" className="btn border border-white/25 px-6 text-base text-white hover:bg-white/10 hover:text-white">
                  See how it’s built
                </a>
              </div>
              <p className="text-sm text-stone-400">
                Early-bird from <strong className="text-white">{PRICES.go.early}</strong> for people on the waitlist. No payment now.
              </p>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[560px] [mask-image:radial-gradient(closest-side,#000_78%,transparent)]">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/get/turntable-poster.webp"
                aria-label="Petrol Pal Pro in black and Petrol Pal Go in white, turning slowly"
              >
                <source src="/get/turntable-720.mp4" type="video/mp4" media="(max-width: 767px)" />
                <source src="/get/turntable-1080.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <p className="pb-6 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500">Concept renders · final hardware may differ</p>
        </section>

        {/* 2 — The problem */}
        <section aria-labelledby="e20-h" className="bg-stone-50 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 md:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-5">
              <Eyebrow>The problem</Eyebrow>
              <h2 id="e20-h" className="text-4xl font-bold leading-[1.05] tracking-tight md:text-[52px]">
                Petrol is now E20. You can’t see the difference.
              </h2>
              <p className="max-w-[52ch] text-lg text-stone-600">
                The petrol sold across India is blended with about 20% ethanol. Ethanol mixes completely with petrol, so a different blend looks, smells and pours the same.
              </p>
              <p className="max-w-[52ch] text-lg text-stone-600">
                Until now, checking what you paid for meant sending a sample to a lab. Petrol Pal puts that check in your pocket.
              </p>
            </div>
            <div className="flex justify-center text-stone-900">
              <E20Column />
            </div>
          </div>
        </section>

        {/* 3 — Dip. Read. Know. */}
        <section aria-labelledby="use-h" className="bg-white px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <Eyebrow>How you use it</Eyebrow>
              <h2 id="use-h" className="text-5xl font-bold tracking-[-0.03em] md:text-7xl">
                Fill. Dip. Read.
              </h2>
              <p className="max-w-[52ch] text-lg text-stone-600">The clear cap that protects the sensor is also the sample cup. There’s nothing else to carry.</p>
            </div>
            <ol className="grid gap-5 md:grid-cols-3">
              {[
                ['Fill', 'Take the cap off and fill it to the line with a little petrol from the nozzle.', <StepFill key="f" />],
                ['Dip', 'Press the button and dip the gold paddle into the cap.', <StepDip key="d" />],
                ['Read', 'Pro shows the ethanol percentage. Go lights up green, white or red.', <StepRead key="r" />],
              ].map(([t, d, g], i) => (
                <li key={t} className="flex flex-col gap-4 rounded-[28px] bg-stone-100 p-7">
                  <div className="h-40 w-40 self-center text-stone-800">{g}</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-pal-700">0{i + 1}</span>
                    <strong className="text-2xl tracking-tight">{t}</strong>
                  </div>
                  <p className="text-stone-600">{d}</p>
                </li>
              ))}
            </ol>
            <div className="relative mx-auto w-full max-w-[720px]">
              <Image src="/get/pro-cap.webp" alt="Petrol Pal Pro beside its clear cap, filled with a petrol sample" width={920} height={1400} className="mx-auto h-auto w-[60%] max-w-[420px]" sizes="(max-width: 768px) 60vw, 420px" />
            </div>
          </div>
        </section>

        {/* 4 — Engineering (scroll-driven 3D) */}
        <EngineeringStory />

        {/* 5 — The sensor, close up */}
        <section aria-labelledby="gold-h" className="bg-[#0E1214] px-5 pb-24 text-white md:px-8">
          <div className="mx-auto grid max-w-[1180px] items-center gap-10 md:grid-cols-[1fr_1.2fr]">
            <div className="flex flex-col gap-5">
              <Eyebrow dark>The sensor</Eyebrow>
              <h2 id="gold-h" className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                Two gold combs, one millimetre apart.
              </h2>
              <p className="max-w-[46ch] text-lg text-stone-300">
                The sensing paddle is an interdigitated electrode: two combs of gold fingers that interlock without touching. Petrol fills the gaps, and the paddle measures how much electric charge the sample can hold.
              </p>
              <dl className="grid max-w-[460px] grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 font-mono text-sm">
                {[
                  ['Sensing area', '40 × 20 mm'],
                  ['Finger pitch', '2 mm per comb'],
                  ['Gap between combs', '1 mm'],
                  ['Temperature', 'NTC on the tip'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1">
                    <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">{k}</dt>
                    <dd className="text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Image src="/get/paddle-macro.webp" alt="Close-up of the gold interdigitated electrode on the sensing paddle" width={1400} height={962} className="h-auto w-full rounded-3xl" sizes="(max-width: 768px) 100vw, 640px" />
          </div>
        </section>

        {/* 6 — How it measures */}
        <section aria-labelledby="science-h" className="bg-stone-50 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-12">
            <div className="flex max-w-[760px] flex-col gap-5">
              <Eyebrow>The science</Eyebrow>
              <h2 id="science-h" className="text-4xl font-bold leading-[1.05] tracking-tight md:text-[52px]">
                Ethanol holds about twelve times more charge than petrol.
              </h2>
              <p className="text-lg text-stone-600">
                Every liquid stores some electric charge in an electric field. Petrol stores very little; ethanol stores far more. So the more ethanol in the sample, the more charge the paddle holds. Petrol Pal measures that, corrects it for temperature, and turns it into an ethanol percentage.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <figure className="flex flex-col gap-4 rounded-[28px] bg-white p-6 text-stone-900 ring-1 ring-stone-200 md:p-8">
                <PermittivityBars />
                <figcaption className="text-sm text-stone-600">Typical values at room temperature, drawn to scale.</figcaption>
              </figure>
              <figure className="flex flex-col gap-4 rounded-[28px] bg-white p-6 text-stone-900 ring-1 ring-stone-200 md:p-8">
                <CombField />
                <figcaption className="text-sm text-stone-600">The electric field between neighbouring fingers passes through the sample. More ethanol, stronger effect.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 7 — Go vs Pro */}
        <section aria-labelledby="models-h" className="bg-white px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <Eyebrow>Two models</Eyebrow>
              <h2 id="models-h" className="text-4xl font-bold tracking-tight md:text-[52px]">
                Which Petrol Pal is yours?
              </h2>
            </div>
            <div className="flex flex-wrap gap-6">
              <ProductCard
                name="Petrol Pal Go"
                model="go"
                blurb="A quick, clear answer for everyday riders and drivers."
                points={['Three lights: green good, white unclear, red check', 'Works on its own — no phone needed', 'Small enough for a glovebox or a pocket']}
                price={PRICES.go.price}
                earlyBird={PRICES.go.early}
                images={[
                  { id: 'white', label: 'White', swatch: '#ECEEEB', src: '/get/go-white.webp', w: 791, h: 1534 },
                  { id: 'black', label: 'Black', swatch: '#1C1F22', src: '/get/go-black.webp', w: 791, h: 1534 },
                ]}
              />
              <ProductCard
                featured
                name="Petrol Pal Pro"
                model="pro"
                blurb="The exact number, for enthusiasts and fleet owners."
                points={['Screen shows the exact ethanol percentage', 'Scan its QR code to add your test to the map', 'Bluetooth link to your phone']}
                price={PRICES.pro.price}
                earlyBird={PRICES.pro.early}
                images={[
                  { id: 'black', label: 'Black', swatch: '#1C1F22', src: '/get/pro-black.webp', w: 678, h: 1574 },
                  { id: 'white', label: 'White', swatch: '#ECEEEB', src: '/get/pro-white.webp', w: 678, h: 1574 },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 8 — Connected */}
        <section aria-labelledby="map-h" className="bg-stone-50 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 md:grid-cols-[1fr_1fr]">
            <div className="order-2 flex justify-center md:order-1">
              <div className="relative w-[270px] rounded-[44px] bg-stone-900 p-3 shadow-2xl">
                <div className="relative overflow-hidden rounded-[34px] bg-[#E8EEF1]">
                  <Image src="/get/map-phone.webp" alt="The Petrol Pal map of petrol pumps across India on a phone" width={520} height={867} className="h-auto w-full" sizes="270px" />
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white p-3.5 shadow-lg">
                    <span className="text-[11px] text-stone-500">Your test · Alandur, Chennai</span>
                    <div className="text-lg font-bold">Test uploaded ✓</div>
                    <span className="text-[11px] text-stone-600">Counts toward this pump’s result</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 flex flex-col gap-5 md:order-2">
              <Eyebrow>Part of something bigger</Eyebrow>
              <h2 id="map-h" className="text-4xl font-bold leading-[1.05] tracking-tight md:text-[52px]">
                Every Pro test can help everyone.
              </h2>
              <p className="max-w-[48ch] text-lg text-stone-600">
                After a test, Pro shows a QR code. Scan it with your phone and your result is added to the Petrol Pal map — no app, no account. When enough people test a pump, everyone can see how it compares with E20.
              </p>
              <p className="font-mono text-sm text-stone-500">
                <strong className="text-2xl text-stone-900">19,346</strong> pumps already on the map
              </p>
              <Link href="/" className="btn-secondary self-start">
                Open the map
              </Link>
            </div>
          </div>
        </section>

        {/* 9 — Datasheet */}
        <section aria-labelledby="spec-h" className="bg-white px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Eyebrow>Datasheet</Eyebrow>
              <h2 id="spec-h" className="text-4xl font-bold tracking-tight md:text-[52px]">
                Design targets
              </h2>
              <p className="max-w-[60ch] text-stone-600">
                Petrol Pal is in development. These are the specifications we are designing towards. Final figures will be published after testing.
              </p>
            </div>
            <div className="overflow-x-auto rounded-3xl ring-1 ring-stone-200">
              <table className="w-full min-w-[640px] border-collapse text-[14.5px]">
                <thead>
                  <tr className="bg-stone-100 text-left">
                    <th scope="col" className="px-5 py-4 font-mono text-xs font-medium uppercase tracking-[0.14em] text-amber-800">
                      All values are targets
                    </th>
                    <th scope="col" className="px-5 py-4 text-base">
                      Go
                    </th>
                    <th scope="col" className="px-5 py-4 text-base">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SPECS.map(([k, go, pro]) => (
                    <tr key={k} className="border-t border-stone-200">
                      <th scope="row" className="w-[28%] px-5 py-3.5 text-left font-medium text-stone-600">
                        {k}
                      </th>
                      <td className="px-5 py-3.5 font-mono text-[13.5px]">{go}</td>
                      <td className="px-5 py-3.5 font-mono text-[13.5px]">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 10 — Early bird + waitlist */}
        <section id="waitlist" aria-labelledby="wl-h" className="scroll-mt-16 bg-[#0E1214] px-5 py-20 text-white md:px-8 md:py-28">
          <span id="waitlist-go" className="sr-only" />
          <span id="waitlist-pro" className="sr-only" />
          <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col gap-6">
              <Eyebrow dark>Early bird</Eyebrow>
              <h2 id="wl-h" className="text-4xl font-bold leading-[1.05] tracking-tight md:text-[52px]">
                Lock in the early-bird price.
              </h2>
              <p className="max-w-[46ch] text-lg text-stone-300">
                Join the waitlist today. When orders open, you’ll be offered the early-bird price for your first device. No payment now, and no obligation to buy.
              </p>
              <div className="grid max-w-[460px] grid-cols-2 gap-3">
                {[
                  ['Petrol Pal Go', PRICES.go],
                  ['Petrol Pal Pro', PRICES.pro],
                ].map(([n, p]) => (
                  <div key={n} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="text-sm text-stone-400">{n}</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{p.early}</span>
                      <span className="text-stone-500 line-through">{p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-6 text-stone-900 md:p-8">
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* 11 — FAQ */}
        <section aria-labelledby="faq-h" className="bg-stone-50 px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto flex max-w-[860px] flex-col gap-6">
            <h2 id="faq-h" className="text-3xl font-bold tracking-tight md:text-4xl">
              Questions
            </h2>
            <div className="flex flex-col gap-2.5">
              {FAQ.map(([q, a]) => (
                <details key={q} className="card group px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {q}
                      <span aria-hidden="true" className="text-xl text-pal-700 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2 text-stone-700">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
