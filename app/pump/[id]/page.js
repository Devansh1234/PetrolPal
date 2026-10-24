import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, placeLine } from '@/lib/status';
import StatusBlock from '@/components/StatusBlock';
import ShareButton from '@/components/ShareButton';
import Footer from '@/components/Footer';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(id) {
  if (!UUID.test(id)) return null;
  const supabase = createClient();
  const { data } = await supabase.rpc('pump_detail', { p_id: id });
  return data || null;
}

export async function generateMetadata({ params }) {
  const pump = await load(params.id);
  if (!pump) return { title: 'Pump not found' };
  return {
    title: `${pump.name}, ${pump.city || pump.state}`,
    description: `${pump.brand_name} petrol pump in ${placeLine(pump)}. Directions, community fuel test results and visitor reviews on Petrol Pal.`,
  };
}

const FUELS = { petrol: 'Petrol', diesel: 'Diesel', cng: 'CNG', lpg: 'LPG', octane_91: 'Petrol (91)', octane_95: 'Premium petrol (95)', HGV_diesel: 'Truck diesel', biodiesel: 'Biodiesel', electricity: 'EV charging' };

export default async function PumpPage({ params }) {
  const pump = await load(params.id);
  if (!pump) notFound();

  const supabase = createClient();
  const [{ data: reviews }, { data: stats }, { data: extra }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, author_name, rating, body, tags, created_at')
      .eq('pump_id', pump.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.rpc('site_stats'),
    supabase.from('pumps').select('fuels').eq('id', pump.id).maybeSingle(),
  ]);

  const fuels = (extra?.fuels || '')
    .split(';')
    .filter(Boolean)
    .map((f) => FUELS[f] || f)
    .filter((v, i, a) => a.indexOf(v) === i);
  const rating = pump.rating?.count ? pump.rating : null;

  return (
    <>
      <main className="page flex max-w-[1120px] flex-col gap-6">
        <Link href="/" className="text-sm font-semibold no-underline">
          ← Back to map
        </Link>

        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-2 text-sm text-stone-600">
              <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: pump.brand_color }} />
              {pump.brand_name}
            </span>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight">{pump.name}</h1>
            <p className="text-stone-600">{placeLine(pump)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/test?pump=${pump.id}`} className="btn-primary">
              Test this pump
            </Link>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pump.lat},${pump.lng}`}
              target="_blank"
              rel="noopener"
              className="btn-secondary"
            >
              Directions
            </a>
            <ShareButton title={`${pump.name}, ${pump.city || pump.state} — Petrol Pal`} />
          </div>
        </section>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
            <section aria-labelledby="results-h" className="card flex flex-col gap-3.5 p-5 md:p-6">
              <h2 id="results-h" className="text-lg font-bold">
                Fuel test results
              </h2>
              <StatusBlock quality={pump.quality} minReadings={stats?.min_readings} pumpId={pump.id} />
              <p className="text-[13px] text-stone-600">
                Results come from Petrol Pal testers owned by members of the public. They’re an indication, not a lab certificate.{' '}
                <Link href="/how">How results work</Link>
              </p>
            </section>

            <section aria-labelledby="exp-h" className="card flex flex-col gap-4 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <h2 id="exp-h" className="text-lg font-bold">
                    Visitor experiences
                  </h2>
                  <span className="text-sm text-stone-600">
                    {rating ? `★ ${rating.avg} average · ${rating.count} review${rating.count === 1 ? '' : 's'}` : 'No reviews yet'}
                  </span>
                </div>
                <Link href={`/pump/${pump.id}/review`} className="btn-outline">
                  Write a review
                </Link>
              </div>

              {(reviews || []).map((r) => (
                <article key={r.id} className="flex flex-col gap-1.5 border-t border-stone-200 pt-3.5">
                  <div className="flex justify-between gap-2">
                    <strong>{r.author_name || 'Petrol Pal user'}</strong>
                    <span className="text-[13px] text-stone-500">{formatDate(r.created_at)}</span>
                  </div>
                  <span aria-label={`${r.rating} out of 5 stars`} className="tracking-widest text-amber-700">
                    {'★'.repeat(r.rating)}
                    <span className="text-stone-300">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                  {r.body && <p className="whitespace-pre-line">{r.body}</p>}
                  {r.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[12.5px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
              <p className="text-[13px] text-stone-600">Every review is checked by Petrol Pal before it appears.</p>
            </section>
          </div>

          <aside className="flex flex-[1_1_300px] flex-col gap-4">
            <section aria-labelledby="det-h" className="card flex flex-col gap-3 p-5">
              <h2 id="det-h" className="text-base font-bold">
                Pump details
              </h2>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                <dt className="text-stone-600">Brand</dt>
                <dd>{pump.brand_name}</dd>
                {pump.address && (
                  <>
                    <dt className="text-stone-600">Address</dt>
                    <dd>{pump.address}</dd>
                  </>
                )}
                <dt className="text-stone-600">City / area</dt>
                <dd>{pump.city || '—'}</dd>
                <dt className="text-stone-600">District</dt>
                <dd>{pump.district || '—'}</dd>
                <dt className="text-stone-600">State</dt>
                <dd>{pump.state}</dd>
                {pump.pincode && (
                  <>
                    <dt className="text-stone-600">PIN code</dt>
                    <dd>{pump.pincode}</dd>
                  </>
                )}
                {fuels.length > 0 && (
                  <>
                    <dt className="text-stone-600">Fuels</dt>
                    <dd>{fuels.join(', ')}</dd>
                  </>
                )}
              </dl>
              {pump.source === 'osm' && (
                <p className="text-[12.5px] text-stone-500">Location from OpenStreetMap. City is the nearest town and may be approximate.</p>
              )}
            </section>

            <section className="card flex flex-col gap-1.5 p-5">
              <h2 className="text-base font-bold">Something not right?</h2>
              <Link href={`/report?pump=${pump.id}`} className="font-semibold no-underline">
                Report wrong info →
              </Link>
              <span className="text-[13px] text-stone-600">Wrong location, closed, wrong brand or a duplicate.</span>
              <Link href={`/report?pump=${pump.id}&kind=owner_response`} className="mt-2 font-semibold no-underline">
                Own or manage this pump? →
              </Link>
              <span className="text-[13px] text-stone-600">Tell us and we’ll get in touch.</span>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
