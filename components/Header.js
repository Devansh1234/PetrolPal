import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';
import { HeaderLinks } from './Nav';
import { LogoMark } from './icons';

export default async function Header() {
  const user = await getUser();
  const initial = (user?.user_metadata?.full_name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-stone-200 bg-white px-4 py-3 md:gap-7 md:px-7">
      <Link href="/" className="flex items-center gap-2.5 text-[19px] font-bold tracking-tight text-stone-900 no-underline hover:text-stone-900">
        <LogoMark />
        Petrol Pal
      </Link>
      <HeaderLinks />
      <div className="ml-auto md:ml-0">
        {user ? (
          <Link
            href="/account"
            aria-label="My account"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pal-50 font-bold text-pal-700 no-underline"
          >
            {initial}
          </Link>
        ) : (
          <Link href="/signin" className="btn-secondary min-h-[40px] py-2">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
