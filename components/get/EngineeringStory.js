'use client';
import { useEffect, useRef, useState } from 'react';

// Scroll-driven exploded view of Petrol Pal Pro. The 3D stage loads only when the section
// is about to come into view; without WebGL (or with reduced motion) a still render is shown.
export const STEPS = [
  {
    k: 'Petrol Pal Pro',
    t: 'Engineered from the sensor out.',
    d: 'Every part has one job, and nothing is there for show. Keep scrolling to take it apart.',
  },
  {
    k: 'Sensing paddle',
    t: '40 × 20 mm of gold.',
    d: 'Two interlocking gold combs printed on the circuit board. The petrol sample fills the gaps between them, and that is what we measure.',
  },
  {
    k: 'Temperature sensor',
    t: 'Measures the fuel, not the air.',
    d: 'A tiny thermistor sits on the tip of the paddle, inside the sample, so every reading is corrected for the fuel’s actual temperature.',
  },
  {
    k: 'Sealed collar',
    t: 'Wet below. Dry above.',
    d: 'The coloured collar marks the seal. A fuel-rated gasket keeps petrol on the paddle and away from the electronics.',
  },
  {
    k: 'Main board',
    t: 'A quiet circuit for a small signal.',
    d: 'The measurement circuit gets its own filtered power supply and a stable reference, so the reading stays steady as the batteries run down.',
  },
  {
    k: 'Two AAA cells',
    t: 'Batteries you can buy anywhere.',
    d: 'Two standard AAA cells. No charger, no cable, nothing to forget at home.',
  },
  {
    k: 'Display',
    t: 'The answer, at a glance.',
    d: 'Pro shows the ethanol percentage and where it sits against E20. Go uses three lights: green, white or red.',
  },
];

function useNear(ref, margin = '400px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

export default function EngineeringStory() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('loading'); // loading | live | still
  const near = useNear(sectionRef);

  // Load the 3D stage when the section is near.
  useEffect(() => {
    if (!near || stageRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    })();
    if (reduce || !gl) {
      setMode('still');
      return;
    }
    let cancelled = false;
    import('@/components/device/stage')
      .then(({ initStage }) => {
        if (cancelled || !canvasRef.current) return;
        stageRef.current = initStage(canvasRef.current, { kind: 'pro', colour: 'black' });
        setMode('live');
        onScroll();
      })
      .catch(() => setMode('still'));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  function onScroll() {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    stageRef.current?.setProgress(p);
    setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.999)));
  }

  useEffect(() => {
    const onResize = () => {
      stageRef.current?.resize();
      onScroll();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([e]) => stageRef.current?.setVisible(e.isIntersecting));
    if (sectionRef.current) io.observe(sectionRef.current);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      io.disconnect();
      stageRef.current?.dispose();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === 'still') {
    return (
      <section id="engineering" aria-labelledby="eng-h" className="bg-[#0E1214] px-5 py-20 text-white md:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
          <h2 id="eng-h" className="max-w-[18ch] text-4xl font-bold tracking-tight md:text-5xl">
            {STEPS[0].t}
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/get/exploded-pro.webp" alt="Petrol Pal Pro taken apart: front panel, display, main board, two AAA cells, housing, collar and gold sensing paddle" className="w-full max-w-[1000px] self-center" loading="lazy" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.slice(1).map((s) => (
              <li key={s.k} className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-teal-300">{s.k}</span>
                <strong className="text-lg">{s.t}</strong>
                <span className="text-stone-300">{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  const cur = STEPS[step];
  return (
    <section id="engineering" ref={sectionRef} aria-labelledby="eng-h" className="relative h-[520vh] bg-[#0E1214] text-white">
      <div className="sticky top-[65px] flex h-[calc(100dvh-65px)] flex-col overflow-hidden md:flex-row">
        {/* Text column (desktop) */}
        <div className="relative z-10 hidden w-[42%] flex-col justify-center gap-8 pl-[max(32px,calc((100vw-1180px)/2))] pr-6 md:flex">
          <h2 id="eng-h" className="sr-only">
            How Petrol Pal Pro is built
          </h2>
          <ol className="flex flex-col gap-5">
            {STEPS.map((s, i) => (
              <li
                key={s.k}
                aria-current={i === step ? 'step' : undefined}
                className={`flex flex-col gap-1 transition-all duration-500 ${i === step ? 'opacity-100' : 'opacity-25'}`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-teal-300">{s.k}</span>
                <strong className={`font-bold tracking-tight transition-all duration-500 ${i === step ? 'text-3xl lg:text-4xl' : 'text-lg'}`}>{s.t}</strong>
                <span className={`max-w-[44ch] text-stone-300 transition-all duration-500 ${i === step ? 'block' : 'hidden'}`}>{s.d}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 3D stage */}
        <div className="relative min-h-0 flex-1">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
          {mode === 'loading' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/get/pro-black.webp" alt="" className="absolute left-1/2 top-1/2 h-[80%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-60" />
          )}
          <p className="pointer-events-none absolute bottom-4 left-0 right-0 hidden text-center font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500 md:block">
            Concept model · scroll to explore
          </p>
        </div>

        {/* Text (phone) */}
        <div className="relative z-10 flex min-h-[38%] flex-col justify-start gap-1.5 px-5 pb-20 pt-2 md:hidden" aria-live="polite">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-300">
            {cur.k} · {step + 1}/{STEPS.length}
          </span>
          <strong className="text-2xl font-bold leading-tight tracking-tight">{cur.t}</strong>
          <span className="text-[15px] text-stone-300">{cur.d}</span>
        </div>
      </div>
    </section>
  );
}
