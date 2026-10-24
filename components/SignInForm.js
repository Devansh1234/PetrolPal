'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignInForm({ next = '/account' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | google | sending | sent
  const [error, setError] = useState('');

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function google() {
    setError('');
    setState('google');
    const { error: err } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } });
    if (err) {
      setState('idle');
      setError('Google sign-in isn’t available right now. Use your email instead.');
    }
  }

  async function sendLink(e) {
    e.preventDefault();
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Please enter a valid email.');
    setState('sending');
    const { error: err } = await createClient().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    if (err) {
      setState('idle');
      return setError('We couldn’t send the link. Please try again in a minute.');
    }
    setState('sent');
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={google} disabled={state === 'google'} className="btn-secondary min-h-[50px]">
        {state === 'google' ? 'Opening Google…' : 'Continue with Google'}
      </button>
      <div aria-hidden="true" className="flex items-center gap-3 text-[13px] text-stone-500">
        <span className="h-px flex-1 bg-stone-200" />
        or
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <form onSubmit={sendLink} noValidate className="flex flex-col gap-3">
        <label className="label">
          Email
          <input className="field font-normal" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary min-h-[50px]" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>
      {state === 'sent' && (
        <p role="status" className="rounded-xl bg-pal-50 p-3 text-sm text-pal-800">
          Check your inbox — the link signs you in. No password needed.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
