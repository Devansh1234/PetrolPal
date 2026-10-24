import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/status';
import Footer from '@/components/Footer';

export const metadata = { title: 'My account', robots: { index: false } };

const TABS = [
  ['tests', 'My tests'],
  ['reviews', 'My reviews'],
  ['testers', 'My testers'],
];

const REVIEW_BADGE = {
  pending: ['Waiting for review', 'bg-amber-100 text-amber-900'],
  approved: ['Published', 'bg-pal-50 text-pal-800'],
  rejected: ['Not published', 'bg-stone-100 text-stone-700'],
};

export default async function AccountPage({ searchParams }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect('/signin?next=/account');

  const tab = TABS.some(([k]) => k === searchParams?.tab) ? searchParams.tab : 'tests';
  const [{ data: profile }, { data: isAdmin }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_admin'),
  ]);

  let tests = [];
  let reviews = [];
  let devices = [];
  if (tab === 'tests') tests = (await supabase.rpc('my_readings')).data || [];
  if (tab === 'reviews')
    reviews =
      (
        await supabase
          .from('reviews')
          .select('id, rating, body, status, created_at, pump_id, pumps(name, city)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ).data || [];
  if (tab === 'testers') devices = (await supabase.rpc('my_devices')).data || [];

  const name = profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <>
      <main className="page flex max-w-[860px] flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Hi, {name?.split(' ')[0]}</h1>
            <span className="text-stone-600">{user.email}</span>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link href="/admin" className="btn-secondary">
                Admin
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button className="btn-secondary" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Account sections" className="flex flex-wrap gap-1.5 border-b border-stone-200">
          {TABS.map(([k, label]) => (
            <Link
              key={k}
              href={`/account?tab=${k}`}
              aria-current={tab === k ? 'page' : undefined}
              className={`-mb-px border-b-[3px] px-4 py-2.5 no-underline ${
                tab === k ? 'border-pal-700 font-bold text-pal-700' : 'border-transparent font-medium text-stone-700 hover:text-stone-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {tab === 'tests' &&
          (tests.length === 0 ? (
            <div className="card flex flex-col items-start gap-3 p-6">
              <p className="text-stone-600">No tests yet. Tests you upload while signed in, or from a tester linked to your account, show up here.</p>
              <Link href="/test" className="btn-primary">
                Upload a test
              </Link>
            </div>
          ) : (
            <section aria-label="My tests" className="flex flex-col gap-2.5">
              <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                <table className="w-full min-w-[560px] border-collapse text-[14.5px]">
                  <thead>
                    <tr className="bg-stone-100 text-left">
                      <th scope="col" className="px-4 py-3">Pump</th>
                      <th scope="col" className="px-4 py-3">Date</th>
                      <th scope="col" className="px-4 py-3">Your reading</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t) => (
                      <tr key={t.id} className="border-t border-stone-200">
                        <td className="px-4 py-3">
                          <Link href={`/pump/${t.pump_id}`}>
                            {t.pump_name}
                            {t.city ? `, ${t.city}` : ''}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{formatDate(t.measured_at)}</td>
                        <td className="px-4 py-3">{Number(t.ethanol_pct).toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          {t.status !== 'visible' ? (
                            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[13px] font-semibold text-stone-700">Not counted</span>
                          ) : t.gps_verified ? (
                            <span className="rounded-full bg-pal-50 px-2.5 py-0.5 text-[13px] font-semibold text-pal-800">Counted</span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[13px] font-semibold text-stone-700">Location didn’t match</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[13px] text-stone-600">Your readings are private. Only you see the numbers above.</p>
            </section>
          ))}

        {tab === 'reviews' &&
          (reviews.length === 0 ? (
            <p className="card p-6 text-stone-600">
              You haven’t written any reviews yet. Open a pump from the <Link href="/">map</Link> and choose “Write a review”.
            </p>
          ) : (
            <section aria-label="My reviews" className="flex flex-col gap-2.5">
              {reviews.map((r) => {
                const [label, cls] = REVIEW_BADGE[r.status] || REVIEW_BADGE.pending;
                return (
                  <article key={r.id} className="card flex flex-wrap justify-between gap-2.5 p-4">
                    <div className="flex min-w-0 flex-col">
                      <Link href={`/pump/${r.pump_id}`} className="font-semibold">
                        {r.pumps?.name}
                        {r.pumps?.city ? `, ${r.pumps.city}` : ''}
                      </Link>
                      <span className="text-amber-700">
                        {'★'.repeat(r.rating)}
                        <span className="text-stone-300">{'★'.repeat(5 - r.rating)}</span>
                      </span>
                      {r.body && <span className="text-sm text-stone-600">{r.body}</span>}
                    </div>
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${cls}`}>{label}</span>
                  </article>
                );
              })}
            </section>
          ))}

        {tab === 'testers' && (
          <section aria-label="My testers" className="flex flex-col gap-2.5">
            {devices.length === 0 ? (
              <p className="card p-6 text-stone-600">No testers linked to your account yet. Once you have a Petrol Pal, we’ll link it here for you.</p>
            ) : (
              devices.map((d) => (
                <article key={d.id} className="card flex flex-col p-4">
                  <strong>{d.label || 'Petrol Pal'}</strong>
                  <span className="text-sm text-stone-600">
                    Serial {d.id}
                    {d.last_seen_at ? ` · last used ${formatDate(d.last_seen_at)}` : ''}
                    {d.status !== 'active' ? ' · switched off' : ''}
                  </span>
                </article>
              ))
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
