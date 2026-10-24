import Link from 'next/link';
import { formatDate } from '@/lib/status';
import { CheckIcon } from './icons';

/** The "Fuel test results" panel on a pump page. `quality` is null while the site is in brand mode. */
export default function StatusBlock({ quality, minReadings = 5, pumpId }) {
  const status = quality?.status || 'insufficient';

  if (status === 'consistent') {
    return (
      <div className="flex flex-col gap-3.5">
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-pal-700 px-3.5 py-2 font-semibold text-white">
          <CheckIcon />
          Consistent with E20
        </span>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-stone-100 p-3.5">
            <div className="text-[13px] text-stone-600">Typical reading</div>
            <div className="text-2xl font-bold">{quality.median_pct}%</div>
            <div className="text-xs text-stone-600">ethanol (E20 = 20%)</div>
          </div>
          <div className="rounded-xl bg-stone-100 p-3.5">
            <div className="text-[13px] text-stone-600">Tests</div>
            <div className="text-2xl font-bold">{quality.tests}</div>
            <div className="text-xs text-stone-600">in the last 6 months</div>
          </div>
          <div className="rounded-xl bg-stone-100 p-3.5">
            <div className="text-[13px] text-stone-600">Last tested</div>
            <div className="text-2xl font-bold">{formatDate(quality.last_tested, false)}</div>
            <div className="text-xs text-stone-600">{new Date(quality.last_tested).getFullYear()}</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'no_verdict') {
    return (
      <div className="flex items-start gap-3.5 rounded-xl bg-[#EEF1F7] p-4">
        <span aria-hidden="true" className="mt-1 h-3.5 w-3.5 flex-none rounded-full bg-vary" />
        <div className="flex flex-col gap-1">
          <strong>Readings vary — no rating yet</strong>
          <span className="text-stone-600">Tests here don’t agree closely enough for us to show a result. More tests help.</span>
          <Link href={`/test?pump=${pumpId}`} className="font-semibold">
            Upload a test →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5 rounded-xl bg-stone-100 p-4">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#78716C" strokeWidth="1.7" strokeLinecap="round" className="flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div className="flex flex-col gap-1">
        <strong>Not enough tests yet</strong>
        <span className="text-stone-600">
          Results show here once at least {minReadings} people have tested this pump with their own Petrol Pal. Be one of them.
        </span>
        <Link href={`/test?pump=${pumpId}`} className="font-semibold">
          Upload a test →
        </Link>
      </div>
    </div>
  );
}
