import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/status';
import { TrophyIcon } from '@/components/icons';
import TopFilters from '@/components/TopFilters';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Top pumps',
  description: 'Petrol pumps where Petrol Pal testers consistently found fuel matching E20.',
};

export default async function TopPage({ searchParams }) {
  const supabase = createClient();
  const state = typeof searchParams?.state === 'string' && searchParams.state ? searchParams.state : null;
  const district = typeof searchParams?.district === 'string' && searchParams.district ? searchParams.district : null;

  const { data: stats } = await supabase.rpc('site_stats');
  const live = stats?.mode === 'quality';
  const { data: rows } = live
    ? await supabase.rpc('top_pumps', { p_state: state, p_district: district, p_limit: 100 })
    : { data: [] };
  const { data: all } = live ? await supabase.rpc('top_pumps', { p_limit: 200 }) : { data: [] };
  const states = [...new Set((all || []).map((r) => r.state))].sort();
  const districts = state ? [...new Set((all || []).filter((r) => r.state === state).map((r) => r.district).filter(Boolean))].sort() : [];

  const minR = stats?.min_readings ?? 5;
  const minD = stats?.min_devices ?? 3;
  const months = Math.round((stats?.window_days ?? 180) / 30);

  return (
    <>
      <main className="page flex max-w-[960px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight md:text-[32px]">Top pumps</h1>
          <p className="max-w-[640px] text-stone-600">
            Pumps where Petrol Pal testers consistently found fuel matching E20. We only list a pump after at least {minR} tests from {minD}{' '}
            different testers in the last {months} months.
          </p>
        </div>

        {!live || !(all || []).length ? (
          <section className="card flex flex-col items-center gap-3.5 px-6 py-9 text-center">
            <TrophyIcon width="56" height="56" strokeWidth="1.5" className="text-pal-700" />
            <h2 className="text-[22px] font-bold">Rankings open once enough pumps are tested</h2>
            <p className="max-w-[520px] text-stone-600">Every test you upload brings this closer. Pumps appear here as soon as they have enough tests.</p>
            <p className="text-sm text-stone-600">
              Tests uploaded so far: <strong className="text-stone-900">{(stats?.tests ?? 0).toLocaleString('en-IN')}</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/test" className="btn-primary">
                Upload a test
              </Link>
              <Link href="/get" className="btn-secondary">
                Get a Petrol Pal tester
              </Link>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-4">
            <TopFilters states={states} districts={districts} state={state || ''} district={district || ''} />
            {(rows || []).length === 0 ? (
              <p className="card p-5 text-stone-600">No pumps listed here yet. Try another area.</p>
            ) : (
              <ol className="flex flex-col gap-2.5">
                {rows.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      href={`/pump/${r.id}`}
                      className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-4 text-stone-900 no-underline hover:border-stone-300 hover:text-stone-900"
                    >
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone-100 font-bold">{i + 1}</span>
                      <span className="flex min-w-0 flex-[1_1_220px] flex-col">
                        <strong className="truncate">{r.name}</strong>
                        <span className="truncate text-[13px] text-stone-600">
                          {r.brand_short} · {[r.city, r.state].filter(Boolean).join(', ')}
                        </span>
                      </span>
                      <span className="rounded-full bg-pal-50 px-3 py-1 text-[13px] font-semibold text-pal-800">✓ Consistent with E20</span>
                      <span className="text-[13px] text-stone-600">
                        {r.tests} tests · {formatDate(r.last_tested, false)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <p className="text-[13px] text-stone-600">
          Not seeing a pump? It may not have enough tests yet. A pump missing from this list says nothing bad about it. <Link href="/how">How results work</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
