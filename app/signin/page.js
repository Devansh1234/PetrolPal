import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import SignInForm from '@/components/SignInForm';

export const metadata = { title: 'Sign in', robots: { index: false } };

function safeNext(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/account';
}

export default async function SignInPage({ searchParams }) {
  const next = safeNext(searchParams?.next);
  const user = await getUser();
  if (user) redirect(next);

  return (
    <main className="flex flex-1 items-start justify-center px-5 pb-24 pt-12 md:pt-16">
      <section aria-labelledby="si-h" className="card flex w-full max-w-[420px] flex-col gap-5 p-7">
        <div className="flex flex-col gap-1.5">
          <h1 id="si-h" className="text-[26px] font-bold tracking-tight">
            Sign in to Petrol Pal
          </h1>
          <p className="text-stone-600">Write reviews and keep a history of your tests.</p>
        </div>
        {searchParams?.error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            That sign-in link didn’t work or has expired. Please try again.
          </p>
        )}
        <SignInForm next={next} />
        <div className="rounded-xl bg-stone-100 p-3.5 text-sm text-stone-700">
          You don’t need an account to <Link href="/">view the map</Link> or <Link href="/test">upload a test</Link>.
        </div>
        <p className="text-[12.5px] text-stone-600">
          By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy policy</Link>.
        </p>
      </section>
    </main>
  );
}
