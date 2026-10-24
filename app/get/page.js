import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Get Petrol Pal',
  description: 'Petrol Pal is a pocket tester that measures the ethanol in petrol at the pump. Join the waitlist for Petrol Pal Go or Pro.',
};

function Model({ name, price, blurb, points, cta, href, featured }) {
  return (
    <article className={`relative flex flex-[1_1_320px] flex-col gap-3.5 rounded-2xl bg-white p-6 ${featured ? 'border-2 border-pal-700' : 'border border-stone-200'}`}>
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-pal-700 px-3 py-0.5 text-[12.5px] font-semibold text-white">Adds tests to the map</span>
      )}
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[22px] font-bold">{name}</h2>
        <span className="text-xl font-bold">
          {price}
          <span className="text-[13px] font-normal text-stone-500"> expected</span>
        </span>
      </div>
      <p className="text-stone-600">{blurb}</p>
      <ul className="flex list-disc flex-col gap-1.5 pl-5">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <a href={href} className={`${featured ? 'btn-primary' : 'btn-outline'} mt-auto`}>
        {cta}
      </a>
    </article>
  );
}

export default function GetPage() {
  return (
    <>
      <main className="page flex max-w-[1080px] flex-col gap-10">
        <section className="flex max-w-[680px] flex-col gap-2.5">
          <span className="self-start rounded-full bg-amber-100 px-3 py-1 text-[13px] font-semibold text-amber-900">Coming soon · Join the waitlist</span>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-[40px]">Check the petrol going into your tank</h1>
          <p className="text-[17px] text-stone-600">
            Petrol Pal is a pocket tester that measures the ethanol in petrol, right at the pump. Dip it in a small sample and get your answer.
          </p>
        </section>

        <section aria-label="Models" className="flex flex-wrap gap-5">
          <Model
            name="Petrol Pal Go"
            price="₹1,199"
            blurb="A quick pass or fail for everyday riders and drivers."
            points={['Green or red light — no reading needed', 'Works without a phone', 'Small enough for a glovebox']}
            cta="Join the waitlist for Go"
            href="#waitlist-go"
          />
          <Model
            featured
            name="Petrol Pal Pro"
            price="₹2,299"
            blurb="The exact number, for enthusiasts and fleet owners."
            points={['Screen shows the exact ethanol %', 'Scan its QR code to add your test to the map', 'Bluetooth link to your phone']}
            cta="Join the waitlist for Pro"
            href="#waitlist-pro"
          />
        </section>

        <section aria-labelledby="cmp-h" className="flex flex-col gap-3">
          <h2 id="cmp-h" className="text-[22px] font-bold">
            Which one is for me?
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table className="w-full border-collapse text-[14px] md:text-[14.5px]">
              <thead>
                <tr className="bg-stone-100 text-left">
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Go
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Tells you if petrol matches E20', 'Yes — light', 'Yes — exact %'],
                  ['Add your test to the map', 'No', 'Yes'],
                  ['Phone app', 'Not needed', 'Optional'],
                  ['Best for', 'Daily commuters', 'Enthusiasts, fleets'],
                ].map(([f, go, pro]) => (
                  <tr key={f} className="border-t border-stone-200">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {f}
                    </th>
                    <td className="px-4 py-3">{go}</td>
                    <td className="px-4 py-3">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="waitlist" aria-labelledby="wl-h" className="card flex scroll-mt-24 flex-wrap gap-7 p-6 md:p-7">
          <span id="waitlist-go" className="sr-only" />
          <span id="waitlist-pro" className="sr-only" />
          <div className="flex flex-[1_1_260px] flex-col gap-2">
            <h2 id="wl-h" className="text-2xl font-bold">
              Join the waitlist
            </h2>
            <p className="text-stone-600">We’ll tell you when Petrol Pal is ready to order. No payment now, and no spam.</p>
          </div>
          <WaitlistForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
