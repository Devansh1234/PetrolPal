import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { STATUS, formatDate } from '@/lib/status';
import { ModeSwitch, ReviewQueue, ReportsList, PendingPumps } from '@/components/admin/AdminActions';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect('/signin?next=/admin');
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) notFound();

  const [settingsRes, statsRes, reviewsRes, reportsRes, pendingRes, waitlistRes, qualityRes] = await Promise.all([
    supabase.from('site_settings').select('*').single(),
    supabase.rpc('site_stats'),
    supabase
      .from('reviews')
      .select('id, pump_id, author_name, rating, body, tags, created_at, pumps(name, city)')
      .eq('status', 'pending')
      .order('created_at')
      .limit(100),
    supabase
      .from('pump_reports')
      .select('id, pump_id, kind, message, contact, created_at, pumps(name, city)')
      .eq('status', 'open')
      .order('created_at')
      .limit(100),
    supabase.from('pumps').select('id, name, city, state, lat, lng, submitter_note, created_at').eq('status', 'pending').order('created_at').limit(50),
    supabase.from('waitlist').select('interest'),
    supabase.rpc('admin_pump_quality'),
  ]);

  const settings = settingsRes.data;
  const stats = statsRes.data || {};
  const wl = { go: 0, pro: 0, undecided: 0 };
  for (const w of waitlistRes.data || []) wl[w.interest] = (wl[w.interest] || 0) + 1;
  const wlTotal = (waitlistRes.data || []).length;
  const quality = (qualityRes.data || []).filter((q) => q.status !== 'insufficient');
  const rules = `${settings?.quality_min_readings} tests · ${settings?.quality_min_devices} testers · ${Math.round((settings?.quality_window_days || 180) / 30)} months`;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-5 py-7 md:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-bold tracking-tight">Admin</h1>
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-semibold text-white">Only you can see this</span>
        <nav aria-label="Admin sections" className="ml-auto flex flex-wrap gap-3 text-sm font-semibold">
          <a href="#reviews">Reviews ({reviewsRes.data?.length || 0})</a>
          <a href="#reports">Reports ({reportsRes.data?.length || 0})</a>
          <a href="#waitlist">Waitlist ({wlTotal})</a>
          <a href="#private">Private data</a>
        </nav>
      </div>

      <ModeSwitch mode={settings?.map_color_mode || 'brand'} pumpsWithResult={stats.pumps_with_result || 0} tests={stats.tests || 0} rules={rules} />
      <ReviewQueue reviews={reviewsRes.data || []} />
      <ReportsList reports={reportsRes.data || []} />
      <PendingPumps pumps={pendingRes.data || []} />

      <section id="waitlist" aria-labelledby="wl-h" className="card flex flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="wl-h" className="text-lg font-bold">
            Waitlist <span className="text-stone-500">({wlTotal})</span>
          </h2>
          <a href="/admin/waitlist.csv" className="btn-secondary min-h-[40px] py-1.5">
            Download as spreadsheet (CSV)
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            ['Pro', wl.pro],
            ['Go', wl.go],
            ['Not sure yet', wl.undecided],
          ].map(([l, n]) => (
            <div key={l} className="rounded-xl bg-stone-100 p-3">
              <div className="text-[13px] text-stone-600">{l}</div>
              <div className="text-[22px] font-bold">{n}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="private" aria-labelledby="pv-h" className="card flex flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 id="pv-h" className="text-lg font-bold">
            Private test data
          </h2>
          <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-semibold text-white">Never public</span>
        </div>
        <p className="text-sm text-stone-600">
          Every pump with enough tests, including ones where readings don’t match E20. Use this to raise concerns privately with the oil company or the
          authorities — never to publish.
        </p>
        {quality.length === 0 ? (
          <p className="text-stone-600">No pump has enough tests yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100 text-left">
                  <th className="px-3 py-2.5">Pump</th>
                  <th className="px-3 py-2.5">Brand</th>
                  <th className="px-3 py-2.5">Public status</th>
                  <th className="px-3 py-2.5">Typical %</th>
                  <th className="px-3 py-2.5">Tests / testers</th>
                  <th className="px-3 py-2.5">Last test</th>
                </tr>
              </thead>
              <tbody>
                {quality.map((q) => (
                  <tr key={q.pump_id} className="border-t border-stone-200">
                    <td className="px-3 py-2.5">
                      <Link href={`/pump/${q.pump_id}`}>{q.name}</Link>
                      <div className="text-xs text-stone-500">{[q.city, q.state].filter(Boolean).join(', ')}</div>
                    </td>
                    <td className="px-3 py-2.5">{q.brand}</td>
                    <td className="px-3 py-2.5">{STATUS[q.status]?.short}</td>
                    <td className="px-3 py-2.5 font-semibold">{q.median_pct}%</td>
                    <td className="px-3 py-2.5">
                      {q.n} / {q.devices}
                    </td>
                    <td className="px-3 py-2.5">{formatDate(q.last_tested)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
