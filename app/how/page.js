import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/status';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'How it works',
  description: 'How Petrol Pal tests work, what the results mean, and how we keep them fair.',
};

export default async function HowPage() {
  const { data: s } = await createClient().rpc('site_stats');
  const minR = s?.min_readings ?? 5;
  const minD = s?.min_devices ?? 3;
  const months = Math.round((s?.window_days ?? 180) / 30);

  return (
    <>
      <main className="page flex max-w-[860px] flex-col gap-11 text-base leading-relaxed">
        <section className="flex flex-col gap-2.5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-[38px]">How Petrol Pal works</h1>
          <p className="text-lg text-stone-600">
            People test petrol with their own Petrol Pal and share the result. Together, the tests show where fuel matches what it should be.
          </p>
        </section>

        <section aria-label="Three steps" className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            ['Test at the pump', 'Dip your Petrol Pal in a small sample of the petrol you just bought.'],
            ['Scan and upload', 'Scan the QR code on your tester. Your phone adds the pump’s location.'],
            ['The map learns', 'Once a pump has enough tests, everyone can see the result.'],
          ].map(([t, d], i) => (
            <div key={t} className="card flex flex-col gap-1.5 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pal-700 font-bold text-white">{i + 1}</span>
              <strong className="text-[17px]">{t}</strong>
              <span className="text-[15px] text-stone-600">{d}</span>
            </div>
          ))}
        </section>

        <section aria-labelledby="e20-h" className="flex flex-col gap-2.5">
          <h2 id="e20-h" className="text-[26px] font-bold tracking-tight">
            What is E20?
          </h2>
          <p>
            E20 is petrol blended with about 20% ethanol. It’s the standard petrol sold across India. Petrol Pal measures the ethanol share, so you can
            see whether your fuel is close to that 20%.
          </p>
        </section>

        <section aria-labelledby="col-h" className="flex flex-col gap-3.5">
          <h2 id="col-h" className="text-[26px] font-bold tracking-tight">
            What the results mean
          </h2>
          {[
            ['consistent', `At least ${minR} tests from ${minD} different testers, and they agree the fuel is close to 20% ethanol.`],
            ['no_verdict', 'There are enough tests, but they don’t agree closely. We don’t draw any conclusion from this.'],
            ['insufficient', 'Most pumps start here. It says nothing good or bad about the pump.'],
          ].map(([k, d]) => (
            <div key={k} className="card flex gap-3.5 p-4">
              <span
                aria-hidden="true"
                className="mt-1.5 h-4 w-4 flex-none rounded-full"
                style={k === 'insufficient' ? { border: '2px solid #A8A29E', background: '#F5F5F4' } : { background: STATUS[k].color }}
              />
              <div>
                <strong>{STATUS[k].label}</strong>
                <div className="text-[15px] text-stone-600">{d}</div>
              </div>
            </div>
          ))}
          <p className="text-[15px] text-stone-600">
            While we collect the first tests, map pins show each pump’s brand. Pins switch to test results once enough pumps have been tested.
          </p>
        </section>

        <section aria-labelledby="fair-h" className="flex flex-col gap-2.5">
          <h2 id="fair-h" className="text-[26px] font-bold tracking-tight">
            How we keep results fair
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Each test can only be uploaded once — the QR code is unique and signed by the tester, so it can’t be edited.</li>
            <li>Your phone’s location must match the pump, or the test doesn’t count.</li>
            <li>We need several testers, so one person can’t decide a pump’s result.</li>
            <li>We use the typical (middle) reading, so one unusual test doesn’t swing it.</li>
            <li>Only tests from the last {months} months count.</li>
          </ul>
        </section>

        <section aria-labelledby="not-h" className="card flex flex-col gap-2.5 p-6">
          <h2 id="not-h" className="text-[22px] font-bold">
            Please keep in mind
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Petrol Pal is a consumer device. Results are an indication, not a laboratory certificate.</li>
            <li>It measures ethanol only. It does not test for other substances.</li>
            <li>We don’t publish claims about any pump or company. We only show whether tests agree with E20.</li>
          </ul>
        </section>

        <section aria-labelledby="worry-h" className="flex flex-col gap-2.5">
          <h2 id="worry-h" className="text-[26px] font-bold tracking-tight">
            Worried about fuel you bought?
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Keep your receipt.</li>
            <li>Ask the pump staff for a density check or a quantity check — outlets keep equipment for these.</li>
            <li>Contact the oil company’s customer care number shown at the pump.</li>
            <li>
              You can also <Link href="/report?kind=fuel_concern">tell us privately</Link>. We don’t publish these reports.
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-h" className="flex flex-col gap-2.5">
          <h2 id="faq-h" className="text-[26px] font-bold tracking-tight">
            Questions
          </h2>
          {[
            ['Do I need an account?', 'No. Anyone can view the map and upload tests. Sign in only if you want to write reviews or keep a history of your tests.'],
            ['Where does the list of pumps come from?', 'From OpenStreetMap, a public map made by volunteers. Some pumps may be missing or slightly off — you can report or add them.'],
            ['I run a petrol pump. How do I respond?', 'Use “Own or manage this pump?” on your pump’s page. We’ll get in touch.'],
            ['Who checks the reviews?', 'The Petrol Pal team reads every review before it appears. Reviews about fuel quality or individual staff aren’t published.'],
            ['Can anyone see my test readings?', 'No. Only you see your own numbers. The public only sees a pump’s overall result once it has enough tests.'],
          ].map(([q, a]) => (
            <details key={q} className="card px-4 py-3.5">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-stone-700">{a}</p>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
