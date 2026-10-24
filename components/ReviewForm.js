'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const WORDS = ['Tap a star', 'Poor', 'Below average', 'OK', 'Good', 'Excellent'];
export const REVIEW_TAGS = [
  'Free air',
  'Clean washroom',
  'Drinking water',
  'UPI / cards accepted',
  'Quick service',
  'Helpful staff',
  'Open 24 hours',
  'EV charging',
];

export default function ReviewForm({ pumpId }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [body, setBody] = useState('');
  const [state, setState] = useState('idle'); // idle | saving | done
  const [error, setError] = useState('');

  function toggleTag(t) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!rating) return setError('Please choose a star rating.');
    setState('saving');
    const { error: err } = await createClient()
      .from('reviews')
      .insert({ pump_id: pumpId, rating, tags, body: body.trim() || null });
    if (err) {
      setState('idle');
      if (err.code === '23505') return setError('You’ve already reviewed this pump. You can see it in your account.');
      return setError('Something went wrong. Please try again.');
    }
    setState('done');
  }

  if (state === 'done') {
    return (
      <section role="status" className="card flex flex-col gap-2.5 p-6">
        <strong className="text-xl">Thanks — your review is in</strong>
        <p className="text-stone-600">The Petrol Pal team checks every review before it goes live. You can see its status in your account.</p>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/account?tab=reviews" className="btn-primary">
            My reviews
          </Link>
          <Link href={`/pump/${pumpId}`} className="btn-secondary">
            Back to the pump
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2.5 font-semibold">Overall experience</legend>
        <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              className={`h-12 w-12 rounded-xl text-[34px] leading-none ${n <= rating ? 'text-amber-700' : 'text-stone-300'}`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-stone-600">{WORDS[rating]}</span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 font-semibold">
          What did you find there? <span className="font-normal text-stone-500">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t)}
                className={`min-h-[40px] rounded-full px-3.5 text-sm font-medium ${on ? 'border-2 border-pal-700 bg-pal-50 text-pal-800' : 'border border-stone-300 bg-white'}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 font-semibold">
        <span>
          Tell others about your visit <span className="text-sm font-normal text-stone-500">(optional)</span>
        </span>
        <textarea
          rows={5}
          maxLength={800}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Quick service, clean forecourt, easy to get in and out."
          className="field resize-y font-normal"
        />
        <span className="self-end text-xs font-normal text-stone-500">{body.length}/800</span>
      </label>

      <div className="flex flex-col gap-1 rounded-xl bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
        <strong>Before you post</strong>
        <span>
          Reviews are about your visit — service, facilities, waiting time. We don’t publish claims about fuel quality or quantity, or anything naming
          staff. For fuel concerns,{' '}
          <Link href={`/report?pump=${pumpId}&kind=fuel_concern`} className="text-amber-900 underline">
            tell us privately
          </Link>{' '}
          instead.
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary text-base" disabled={state === 'saving'}>
        {state === 'saving' ? 'Sending…' : 'Submit review'}
      </button>
    </form>
  );
}
