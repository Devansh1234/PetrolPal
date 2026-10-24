'use client';
import { useRouter } from 'next/navigation';

export default function TopFilters({ states, districts, state, district }) {
  const router = useRouter();
  function go(next) {
    const params = new URLSearchParams();
    if (next.state) params.set('state', next.state);
    if (next.district) params.set('district', next.district);
    router.push(`/top${params.toString() ? `?${params}` : ''}`);
  }
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="label flex-[1_1_200px]">
        State
        <select className="field font-normal" value={state} onChange={(e) => go({ state: e.target.value })}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="label flex-[1_1_200px]">
        District
        <select className="field font-normal" value={district} disabled={!state} onChange={(e) => go({ state, district: e.target.value })}>
          <option value="">{state ? 'All districts' : 'Choose a state first'}</option>
          {districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
