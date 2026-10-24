'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import jsQR from 'jsqr';
import { createClient } from '@/lib/supabase/client';
import { formatDistance } from '@/lib/status';
import { CheckIcon } from './icons';

const CODE_RE = /^PP1:[^:\s]+:[^:\s]+:\d+:\d+:\d*:[rp]:[0-9a-f]{32}$/i;

/** Accepts a raw Petrol Pal code or a petrolpal.in/test?c=… link. */
export function parseCode(text) {
  if (!text) return null;
  let raw = text.trim();
  try {
    if (/^https?:\/\//i.test(raw)) raw = new URL(raw).searchParams.get('c') || '';
  } catch {
    return null;
  }
  raw = decodeURIComponent(raw).trim();
  if (!CODE_RE.test(raw)) return null;
  const p = raw.split(':');
  return { code: raw, deviceId: p[1], takenAt: new Date(Number(p[3]) * 1000), pct: Number(p[4]) / 10 };
}

function Steps({ step }) {
  const labels = ['Scan', 'Choose pump', 'Done'];
  const idx = { scan: 1, pump: 2, done: 3 }[step];
  return (
    <ol aria-label="Progress" className="grid grid-cols-3 gap-2">
      {labels.map((l, i) => (
        <li key={l} aria-current={idx === i + 1 ? 'step' : undefined} className="flex flex-col gap-1.5">
          <span aria-hidden="true" className={`h-1.5 rounded-full ${i < idx ? 'bg-pal-700' : 'bg-stone-200'}`} />
          <span className={`text-[13px] ${idx === i + 1 ? 'font-bold' : 'font-medium'} ${i < idx ? 'text-stone-900' : 'text-stone-500'}`}>
            {i + 1}. {l}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Scanner({ onCode }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | starting | live | denied | unsupported
  const [bad, setBad] = useState(false);

  useEffect(() => {
    let stream;
    let raf;
    let stopped = false;
    if (state !== 'starting') return;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState('unsupported');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch {
        setState('denied');
        return;
      }
      if (stopped) return;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play().catch(() => {});
      setState('live');

      const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let last = 0;

      const tick = async (t) => {
        if (stopped) return;
        if (t - last > 220 && video.readyState >= 2) {
          last = t;
          let text = null;
          try {
            if (detector) {
              const found = await detector.detect(video);
              text = found[0]?.rawValue || null;
            } else {
              const w = Math.min(640, video.videoWidth);
              const h = Math.round((video.videoHeight / video.videoWidth) * w);
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(video, 0, 0, w, h);
              const img = ctx.getImageData(0, 0, w, h);
              text = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })?.data || null;
            }
          } catch {
            /* keep scanning */
          }
          if (text) {
            const parsed = parseCode(text);
            if (parsed) {
              onCode(parsed);
              return;
            }
            setBad(true);
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [state, onCode]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-stone-900">
        <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${state === 'live' ? '' : 'hidden'}`} />
        <canvas ref={canvasRef} className="hidden" />
        <div aria-hidden="true" className="relative h-44 w-44 rounded-2xl border-[3px] border-teal-300" />
        {state !== 'live' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-stone-100">
            {state === 'idle' && (
              <button type="button" className="btn-primary" onClick={() => setState('starting')}>
                Open camera
              </button>
            )}
            {state === 'starting' && <span>Starting camera…</span>}
            {state === 'denied' && <span>Camera access was blocked. Allow it in your browser settings, or type the code below.</span>}
            {state === 'unsupported' && <span>This browser can’t use the camera. Type the code below instead.</span>}
          </div>
        )}
      </div>
      {bad && <p role="status" className="text-sm text-stone-700">That QR code isn’t from a Petrol Pal tester. Keep pointing at the code on your tester’s screen.</p>}
      <p className="text-sm text-stone-600">Tip: your phone’s own camera app works too — scanning the code opens this page with your test filled in.</p>
    </div>
  );
}

export default function TestFlow({ initialCode, initialPumpId }) {
  const supabase = createClient();
  const [step, setStep] = useState('scan');
  const [reading, setReading] = useState(null);
  const [manual, setManual] = useState('');
  const [manualError, setManualError] = useState('');

  const [loc, setLoc] = useState(null); // {lat,lng,acc}
  const [locState, setLocState] = useState('idle'); // idle | asking | ok | denied
  const [pumps, setPumps] = useState([]);
  const [pumpsLoading, setPumpsLoading] = useState(false);
  const [picked, setPicked] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const onCode = useCallback((parsed) => {
    setReading(parsed);
    setStep('pump');
  }, []);

  useEffect(() => {
    const parsed = parseCode(initialCode);
    if (parsed) onCode(parsed);
  }, [initialCode, onCode]);

  // Preselected pump from a pump page link.
  useEffect(() => {
    if (!initialPumpId) return;
    supabase.rpc('pump_detail', { p_id: initialPumpId }).then(({ data }) => {
      if (data) {
        const p = { id: data.id, name: data.name, brand_short: data.brand_name, brand_color: data.brand_color, city: data.city, state: data.state, lat: data.lat, lng: data.lng };
        setPicked(p.id);
        setPumps((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev]));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPumpId]);

  function askLocation() {
    if (!navigator.geolocation) {
      setLocState('denied');
      return;
    }
    setLocState('asking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
        setLoc(here);
        setLocState('ok');
        setPumpsLoading(true);
        const { data } = await supabase.rpc('pumps_nearby', { p_lat: here.lat, p_lng: here.lng, p_radius_m: 1500, p_limit: 6 });
        setPumpsLoading(false);
        const near = data || [];
        setPumps((prev) => {
          const pre = prev.filter((p) => !near.some((n) => n.id === p.id));
          return [...near, ...pre];
        });
        setPicked((cur) => cur || near[0]?.id || null);
      },
      () => setLocState('denied'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  useEffect(() => {
    if (step === 'pump' && locState === 'idle') askLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Search fallback (no location, or pump not in the list).
  useEffect(() => {
    const term = search.replace(/[^\p{L}\p{N} .-]/gu, '').trim();
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('pumps')
        .select('id, name, city, state, brands(short_name, color)')
        .or(`name.ilike."%${term}%",city.ilike."%${term}%"`)
        .eq('status', 'approved')
        .limit(8);
      setSearchResults(
        (data || []).map((p) => ({ id: p.id, name: p.name, city: p.city, state: p.state, brand_short: p.brands?.short_name, brand_color: p.brands?.color })),
      );
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function chooseFromSearch(p) {
    setPumps((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev]));
    setPicked(p.id);
    setSearch('');
  }

  async function submit() {
    if (!picked || !reading) return;
    setSubmitting(true);
    setSubmitError('');
    const { data, error } = await supabase.rpc('submit_reading', {
      p_code: reading.code,
      p_pump_id: picked,
      p_lat: loc?.lat ?? null,
      p_lng: loc?.lng ?? null,
      p_accuracy_m: loc?.acc ?? null,
    });
    setSubmitting(false);
    if (error || !data) {
      setSubmitError('Something went wrong. Check your connection and try again.');
      return;
    }
    if (!data.ok) {
      setSubmitError(data.error);
      return;
    }
    setResult(data);
    setStep('done');
  }

  function submitManual(e) {
    e.preventDefault();
    const parsed = parseCode(manual);
    if (!parsed) {
      setManualError('That code doesn’t look right. It starts with PP1: and is shown under the QR code.');
      return;
    }
    setManualError('');
    onCode(parsed);
  }

  function restart() {
    setStep('scan');
    setReading(null);
    setResult(null);
    setSubmitError('');
    setManual('');
    if (typeof window !== 'undefined') window.history.replaceState(null, '', '/test');
  }

  const pickedPump = pumps.find((p) => p.id === picked);
  const takenAt = reading?.takenAt?.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-5">
      <Steps step={step} />

      {step === 'scan' && (
        <section aria-labelledby="scan-h" className="card flex flex-col gap-4 p-5 md:p-6">
          <h2 id="scan-h" className="text-xl font-bold">
            1. Scan the QR code on your tester
          </h2>
          <p className="text-stone-600">After a test, your Petrol Pal shows a QR code on its screen. Point your camera at it.</p>
          <Scanner onCode={onCode} />
          <details className="text-sm text-stone-700">
            <summary className="cursor-pointer font-semibold text-pal-700">Camera not working? Type the code instead</summary>
            <form onSubmit={submitManual} className="mt-3 flex flex-col gap-2">
              <label className="label">
                Code shown under the QR
                <input className="field font-normal" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="PP1:…" autoCapitalize="characters" spellCheck={false} />
              </label>
              {manualError && <p className="text-sm text-red-700">{manualError}</p>}
              <button className="btn-secondary self-start" type="submit">
                Continue
              </button>
            </form>
          </details>
        </section>
      )}

      {step === 'pump' && (
        <section aria-labelledby="pump-h" className="card flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center gap-2.5 rounded-xl bg-pal-50 px-3 py-2.5 text-sm text-pal-800">
            <CheckIcon />
            Test read from your tester · taken {takenAt}
          </div>
          <h2 id="pump-h" className="text-xl font-bold">
            2. Which pump are you at?
          </h2>

          {locState === 'asking' && <p className="text-stone-600">Finding pumps near you…</p>}
          {locState === 'denied' && (
            <div className="rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900">
              We couldn’t get your location. Allow location access and{' '}
              <button type="button" className="font-semibold underline" onClick={askLocation}>
                try again
              </button>
              , or search for the pump below. Tests without a matching location won’t count toward a pump’s result.
            </div>
          )}
          {locState === 'ok' && !pumpsLoading && (
            <p className="text-stone-600">
              {pumps.length ? 'We’ve picked the closest one. Tap another if it’s wrong.' : 'We couldn’t find a pump within 1.5 km. Search for it below.'}
            </p>
          )}

          {pumps.length > 0 && (
            <div role="radiogroup" aria-label="Pumps" className="flex flex-col gap-2">
              {pumps.map((p) => {
                const on = p.id === picked;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPicked(p.id)}
                    className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left ${
                      on ? 'border-2 border-pal-700 bg-[#F2F9F8]' : 'border border-stone-200 bg-white'
                    }`}
                  >
                    <span aria-hidden="true" className={`h-[18px] w-[18px] flex-none rounded-full ${on ? 'border-[6px] border-pal-700' : 'border-2 border-stone-400'}`} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="truncate">{p.name}</strong>
                      <span className="truncate text-[13px] text-stone-600">
                        {[p.brand_short, [p.city, p.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {p.distance_m != null && <span className="flex-none text-[13px] tabular-nums text-stone-600">{formatDistance(p.distance_m)}</span>}
                  </button>
                );
              })}
            </div>
          )}

          <label className="label">
            Not listed? Search by pump name or city
            <input className="field font-normal" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Indian Oil Lanka" />
          </label>
          {searchResults.length > 0 && (
            <ul className="-mt-2 overflow-hidden rounded-xl border border-stone-200">
              {searchResults.map((p) => (
                <li key={p.id} className="border-t border-stone-200 first:border-t-0">
                  <button type="button" onClick={() => chooseFromSearch(p)} className="flex w-full flex-col px-3.5 py-2.5 text-left hover:bg-stone-50">
                    <strong>{p.name}</strong>
                    <span className="text-[13px] text-stone-600">{[p.brand_short, p.city, p.state].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href="/report?kind=missing_pump" className="text-sm font-semibold">
            My pump isn’t on Petrol Pal — tell us
          </Link>

          {submitError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {submitError}
            </p>
          )}
          <div className="flex gap-2.5">
            <button type="button" className="btn-secondary" onClick={restart}>
              Back
            </button>
            <button type="button" className="btn-primary flex-1 text-base" onClick={submit} disabled={!picked || submitting}>
              {submitting ? 'Uploading…' : pickedPump ? `Upload test for ${pickedPump.name}` : 'Choose a pump'}
            </button>
          </div>
        </section>
      )}

      {step === 'done' && result && (
        <section aria-labelledby="done-h" className="card flex flex-col items-start gap-4 p-6">
          <span aria-hidden="true" className="flex items-center justify-center rounded-full bg-pal-50 p-3 text-pal-700">
            <CheckIcon width="28" height="28" />
          </span>
          <h2 id="done-h" className="text-[22px] font-bold">
            3. Test uploaded — thank you
          </h2>
          <div className="flex w-full flex-col gap-1 rounded-xl bg-stone-100 p-4">
            <span className="text-[13px] text-stone-600">Your reading at {pickedPump ? `${pickedPump.name}${pickedPump.city ? `, ${pickedPump.city}` : ''}` : 'this pump'}</span>
            <span className="text-[28px] font-bold">{Number(result.ethanol_pct).toFixed(1)}% ethanol</span>
            <span className="text-[13px] text-stone-600">
              Only you see this number. It counts toward the pump’s public result once enough people have tested there.
            </span>
          </div>
          {!result.gps_verified && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Your location didn’t match this pump closely enough, so this test won’t count toward its result. Next time, upload while you’re at the pump.
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            {picked && (
              <Link href={`/pump/${picked}`} className="btn-primary">
                See this pump
              </Link>
            )}
            <button type="button" className="btn-secondary" onClick={restart}>
              Upload another test
            </button>
          </div>
          <p className="text-sm text-stone-700">
            <Link href="/signin?next=/account" className="font-semibold">
              Sign in
            </Link>{' '}
            to keep a history of your tests and write reviews.
          </p>
        </section>
      )}
    </div>
  );
}
