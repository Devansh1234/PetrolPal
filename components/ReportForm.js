'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export const KINDS = {
  wrong_location: ['Wrong location', 'The pin is in the wrong place', 'Where is it actually? A landmark helps.', false],
  closed: ['Closed permanently', 'This pump no longer operates', 'Roughly when did it close?', false],
  wrong_brand: ['Wrong brand or name', 'e.g. it’s now a different company', 'What brand and name is it now?', false],
  duplicate: ['Duplicate', 'This pump appears twice on the map', 'Anything that helps us find the other one.', false],
  owner_response: ['I own or manage this pump', 'Update details or respond to anything shown', 'Your name, role and what you’d like to change.', true],
  fuel_concern: ['Concern about fuel here', 'Kept private — never shown on the map', 'What happened? Date and time help.', false],
  missing_pump: ['A pump is missing from the map', 'Tell us where it is', 'Pump name, brand, and address or nearest landmark.', false],
  other: ['Something else', '', 'Tell us more.', false],
};

const PUMP_KINDS = ['wrong_location', 'closed', 'wrong_brand', 'duplicate', 'owner_response', 'fuel_concern', 'other'];
const GENERAL_KINDS = ['missing_pump', 'fuel_concern', 'other'];

export default function ReportForm({ pumpId, initialKind }) {
  const kinds = pumpId ? PUMP_KINDS : GENERAL_KINDS;
  const [kind, setKind] = useState(kinds.includes(initialKind) ? initialKind : kinds[0]);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [, , placeholder, contactRequired] = KINDS[kind];

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!message.trim()) return setError('Please add a few details.');
    if (contactRequired && !contact.trim()) return setError('Please leave a phone number or email so we can verify you.');
    setState('saving');
    const { error: err } = await createClient()
      .from('pump_reports')
      .insert({ pump_id: pumpId || null, kind, message: message.trim(), contact: contact.trim() || null });
    if (err) {
      setState('idle');
      return setError('Something went wrong. Please try again.');
    }
    setState('done');
  }

  if (state === 'done') {
    return (
      <section role="status" className="card flex flex-col gap-2.5 p-6">
        <strong className="text-xl">Thanks — we’ve got it</strong>
        <p className="text-stone-600">We’ll review it and update the map if needed. If you left contact details, we may get in touch.</p>
        <Link href={pumpId ? `/pump/${pumpId}` : '/'} className="font-semibold">
          {pumpId ? 'Back to the pump →' : 'Back to the map →'}
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2.5 font-semibold">What’s this about?</legend>
        <div role="radiogroup" className="flex flex-col gap-2">
          {kinds.map((k) => {
            const [label, help] = KINDS[k];
            const on = kind === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setKind(k)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left ${on ? 'border-2 border-pal-700 bg-[#F2F9F8]' : 'border border-stone-200 bg-white'}`}
              >
                <span aria-hidden="true" className={`h-[18px] w-[18px] flex-none rounded-full ${on ? 'border-[6px] border-pal-700' : 'border-2 border-stone-400'}`} />
                <span className="flex flex-col">
                  <strong>{label}</strong>
                  {help && <span className="text-[13px] text-stone-600">{help}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="label text-[15px]">
        Details
        <textarea rows={4} maxLength={1000} className="field resize-y font-normal" placeholder={placeholder} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label className="label text-[15px]">
        <span>
          How can we reach you?{' '}
          <span className="text-sm font-normal text-stone-500">{contactRequired ? '(required, so we can verify you)' : '(optional)'}</span>
        </span>
        <input className="field font-normal" placeholder="Phone or email" value={contact} onChange={(e) => setContact(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary text-base" disabled={state === 'saving'}>
        {state === 'saving' ? 'Sending…' : 'Send to Petrol Pal'}
      </button>
    </form>
  );
}
