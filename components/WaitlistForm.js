'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const OPTIONS = [
  ['go', 'Go · ₹1,200'],
  ['pro', 'Pro · ₹2,500'],
  ['undecided', 'Not sure yet'],
];
const NAMES = { go: 'Petrol Pal Go', pro: 'Petrol Pal Pro', undecided: 'Petrol Pal' };

export default function WaitlistForm() {
  const [interest, setInterest] = useState('pro');
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' });
  const [status, setStatus] = useState('idle'); // idle | saving | done | exists
  const [error, setError] = useState('');

  // "Join the waitlist for Go/Pro" buttons link to #waitlist-go / #waitlist-pro
  useEffect(() => {
    const pick = () => {
      if (window.location.hash === '#waitlist-go') setInterest('go');
      if (window.location.hash === '#waitlist-pro') setInterest('pro');
    };
    pick();
    window.addEventListener('hashchange', pick);
    return () => window.removeEventListener('hashchange', pick);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const phone = form.phone.replace(/[^\d+ -]/g, '').trim();
    const email = form.email.trim();
    if (!name) return setError('Please enter your name.');
    if (!phone && !email) return setError('Please give a mobile number or an email so we can reach you.');
    if (phone && !/^[0-9+ -]{8,16}$/.test(phone)) return setError('That mobile number doesn’t look right.');
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('That email doesn’t look right.');

    setStatus('saving');
    const { error: err } = await createClient()
      .from('waitlist')
      .insert({ name, phone: phone || null, email: email || null, city: form.city.trim() || null, interest });
    if (err) {
      if (err.code === '23505') return setStatus('exists');
      setStatus('idle');
      return setError('Something went wrong. Please try again.');
    }
    setStatus('done');
  }

  if (status === 'done' || status === 'exists') {
    return (
      <div role="status" className="flex flex-[2_1_380px] flex-col gap-2 rounded-2xl bg-pal-50 p-6">
        <strong className="text-lg text-pal-800">{status === 'done' ? 'You’re on the list ✓' : 'You’re already on the list ✓'}</strong>
        <span>We’ll let you know when orders open for {NAMES[interest]}, with your early-bird price. Meanwhile, explore the map.</span>
        <Link href="/" className="font-semibold">
          Go to the map →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-[2_1_380px] flex-col gap-3.5">
      <label className="label">
        Your name
        <input className="field font-normal" autoComplete="name" value={form.name} onChange={set('name')} />
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="label flex-[1_1_180px]">
          Mobile number
          <input className="field font-normal" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={set('phone')} />
        </label>
        <label className="label flex-[1_1_180px]">
          or Email
          <input className="field font-normal" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
        </label>
      </div>
      <label className="label">
        City
        <input className="field font-normal" autoComplete="address-level2" value={form.city} onChange={set('city')} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-stone-700">I’m interested in</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {OPTIONS.map(([k, label]) => {
            const on = interest === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setInterest(k)}
                className={`min-h-[44px] rounded-full px-5 font-semibold ${on ? 'border-2 border-pal-700 bg-pal-50 text-pal-800' : 'border border-stone-300 bg-white'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary text-base" disabled={status === 'saving'}>
        {status === 'saving' ? 'Joining…' : 'Join the waitlist — free'}
      </button>
      <p className="text-[12.5px] text-stone-600">
        By joining you agree to our <Link href="/privacy">Privacy policy</Link>. The early-bird price is offered to waitlist members for their first device when orders open.
      </p>
    </form>
  );
}
