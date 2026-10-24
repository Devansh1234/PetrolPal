'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/status';

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  async function run(key, fn) {
    setBusy(key);
    setError('');
    const { error: err } = await fn(createClient());
    setBusy(null);
    if (err) setError(err.message || 'Something went wrong.');
    else router.refresh();
  }
  return { busy, error, run };
}

export function ModeSwitch({ mode, pumpsWithResult, tests, rules }) {
  const { busy, error, run } = useAction();
  const [confirming, setConfirming] = useState(null);

  function choose(next) {
    if (next === mode) return;
    setConfirming(next);
  }
  function apply() {
    const next = confirming;
    setConfirming(null);
    run('mode', (sb) => sb.from('site_settings').update({ map_color_mode: next, updated_at: new Date().toISOString() }).eq('id', true));
  }

  const card = (on) =>
    `flex flex-col items-start gap-1 rounded-2xl p-4 text-left ${on ? 'border-2 border-pal-700 bg-[#F2F9F8]' : 'border border-stone-300 bg-white hover:bg-stone-50'}`;

  return (
    <section id="switch" aria-labelledby="sw-h" className="card flex flex-col gap-3.5 p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="sw-h" className="text-lg font-bold">
          What should map pins show?
        </h2>
        <p className="text-stone-600">Changes the public map, pump pages and Top pumps immediately. You can switch back any time.</p>
      </div>
      <div role="radiogroup" aria-label="Map pins show" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button type="button" role="radio" aria-checked={mode === 'brand'} onClick={() => choose('brand')} className={card(mode === 'brand')}>
          <strong className="text-base">Brand colours</strong>
          <span className="text-[13.5px] text-stone-600">IndianOil orange, HPCL blue… Test results stay hidden.</span>
        </button>
        <button type="button" role="radio" aria-checked={mode === 'quality'} onClick={() => choose('quality')} className={card(mode === 'quality')}>
          <strong className="text-base">Test results</strong>
          <span className="text-[13.5px] text-stone-600">Consistent with E20 · Readings vary · Not enough tests.</span>
        </button>
      </div>
      {confirming && (
        <div role="alertdialog" aria-label="Confirm switch" className="flex flex-col gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
          <strong>
            Switch the public map to {confirming === 'quality' ? 'test results' : 'brand colours'}?
          </strong>
          {confirming === 'quality' && (
            <span className="text-sm">
              {pumpsWithResult} pump{pumpsWithResult === 1 ? '' : 's'} currently have enough tests to show a result. Everyone else will see “Not enough tests”.
            </span>
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-primary" onClick={apply} disabled={busy === 'mode'}>
              Yes, switch now
            </button>
            <button type="button" className="btn-secondary" onClick={() => setConfirming(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl bg-stone-100 p-3">
          <div className="text-[13px] text-stone-600">Tests uploaded</div>
          <div className="text-[22px] font-bold">{tests.toLocaleString('en-IN')}</div>
        </div>
        <div className="rounded-xl bg-stone-100 p-3">
          <div className="text-[13px] text-stone-600">Pumps with a result</div>
          <div className="text-[22px] font-bold">{pumpsWithResult.toLocaleString('en-IN')}</div>
        </div>
        <div className="rounded-xl bg-stone-100 p-3">
          <div className="text-[13px] text-stone-600">Rule for a result</div>
          <div className="text-[15px] font-bold">{rules}</div>
        </div>
      </div>
      <p role="status" className="rounded-xl bg-pal-50 px-3 py-2.5 text-sm text-pal-800">
        Live now: pins show {mode === 'quality' ? 'test results' : 'brand colours'}.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}

export function ReviewQueue({ reviews }) {
  const { busy, error, run } = useAction();
  const [notes, setNotes] = useState({});
  function decide(id, status) {
    run(id, (sb) =>
      sb
        .from('reviews')
        .update({ status, moderation_note: notes[id] || null, moderated_at: new Date().toISOString() })
        .eq('id', id),
    );
  }
  return (
    <section id="reviews" aria-labelledby="rv-h" className="card flex flex-col gap-3 p-5 md:p-6">
      <h2 id="rv-h" className="text-lg font-bold">
        Reviews to check <span className="text-stone-500">({reviews.length})</span>
      </h2>
      <p className="text-[13.5px] text-stone-600">
        Reject anything about fuel quality or quantity, naming staff, personal attacks, or spam. Approved reviews go live straight away.
      </p>
      {reviews.length === 0 && <p className="text-stone-600">Nothing waiting.</p>}
      {reviews.map((r) => (
        <article key={r.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-stone-200 p-3.5">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-0.5">
            <span className="text-[13px] text-stone-600">
              <Link href={`/pump/${r.pump_id}`}>
                {r.pumps?.name}
                {r.pumps?.city ? `, ${r.pumps.city}` : ''}
              </Link>{' '}
              · {r.author_name} · {formatDate(r.created_at)}
            </span>
            <span className="text-amber-700">
              {'★'.repeat(r.rating)}
              <span className="text-stone-300">{'★'.repeat(5 - r.rating)}</span>
            </span>
            {r.body && <p className="whitespace-pre-line">{r.body}</p>}
            {r.tags?.length > 0 && <span className="text-[13px] text-stone-600">{r.tags.join(' · ')}</span>}
            <input
              className="field mt-1.5 py-1.5 text-sm"
              placeholder="Note to self (optional)"
              value={notes[r.id] || ''}
              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-primary min-h-[40px] py-1.5" disabled={busy === r.id} onClick={() => decide(r.id, 'approved')}>
              Approve
            </button>
            <button type="button" className="btn-secondary min-h-[40px] py-1.5" disabled={busy === r.id} onClick={() => decide(r.id, 'rejected')}>
              Reject
            </button>
          </div>
        </article>
      ))}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}

const KIND_LABEL = {
  wrong_location: 'Wrong location',
  closed: 'Closed',
  wrong_brand: 'Wrong brand / name',
  wrong_name: 'Wrong name',
  duplicate: 'Duplicate',
  owner_response: 'Pump owner',
  missing_pump: 'Missing pump',
  fuel_concern: 'Fuel concern (private)',
  other: 'Other',
};

export function ReportsList({ reports }) {
  const { busy, error, run } = useAction();
  return (
    <section id="reports" aria-labelledby="rp-h" className="card flex flex-col gap-3 p-5 md:p-6">
      <h2 id="rp-h" className="text-lg font-bold">
        Open reports <span className="text-stone-500">({reports.length})</span>
      </h2>
      {reports.length === 0 && <p className="text-stone-600">No open reports.</p>}
      {reports.map((r) => (
        <article key={r.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-stone-200 p-3.5">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-0.5">
            <span className="text-[13px] font-semibold">{KIND_LABEL[r.kind] || r.kind}</span>
            <span className="text-[13px] text-stone-600">
              {r.pump_id ? (
                <Link href={`/pump/${r.pump_id}`}>
                  {r.pumps?.name}
                  {r.pumps?.city ? `, ${r.pumps.city}` : ''}
                </Link>
              ) : (
                'No pump'
              )}{' '}
              · {formatDate(r.created_at)}
              {r.contact ? ` · ${r.contact}` : ''}
            </span>
            {r.message && <p className="whitespace-pre-line">{r.message}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary min-h-[40px] py-1.5"
              disabled={busy === r.id}
              onClick={() => run(r.id, (sb) => sb.from('pump_reports').update({ status: 'resolved' }).eq('id', r.id))}
            >
              Done
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[40px] py-1.5"
              disabled={busy === r.id}
              onClick={() => run(r.id, (sb) => sb.from('pump_reports').update({ status: 'dismissed' }).eq('id', r.id))}
            >
              Dismiss
            </button>
          </div>
        </article>
      ))}
      <p className="text-[13px] text-stone-600">To fix a pump’s details, edit it in the Supabase table editor (table “pumps”).</p>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}

export function PendingPumps({ pumps }) {
  const { busy, error, run } = useAction();
  if (!pumps.length) return null;
  return (
    <section aria-labelledby="pp-h" className="card flex flex-col gap-3 p-5 md:p-6">
      <h2 id="pp-h" className="text-lg font-bold">
        New pumps to approve <span className="text-stone-500">({pumps.length})</span>
      </h2>
      {pumps.map((p) => (
        <article key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-stone-200 p-3.5">
          <div className="flex flex-col">
            <strong>{p.name}</strong>
            <span className="text-[13px] text-stone-600">
              {[p.city, p.state].filter(Boolean).join(', ')} · {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
            </span>
            {p.submitter_note && <span className="text-sm">{p.submitter_note}</span>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary min-h-[40px] py-1.5"
              disabled={busy === p.id}
              onClick={() => run(p.id, (sb) => sb.from('pumps').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', p.id))}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[40px] py-1.5"
              disabled={busy === p.id}
              onClick={() => run(p.id, (sb) => sb.from('pumps').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', p.id))}
            >
              Reject
            </button>
          </div>
        </article>
      ))}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
