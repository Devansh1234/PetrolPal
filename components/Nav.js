'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PinIcon, ScanIcon, TrophyIcon, DeviceIcon, HelpIcon } from './icons';

export const NAV = [
  { href: '/', label: 'Map', short: 'Map', Icon: PinIcon },
  { href: '/test', label: 'Test a pump', short: 'Test', Icon: ScanIcon },
  { href: '/top', label: 'Top pumps', short: 'Top pumps', Icon: TrophyIcon },
  { href: '/get', label: 'Get Petrol Pal', short: 'Get tester', Icon: DeviceIcon },
  { href: '/how', label: 'How it works', short: 'How it works', Icon: HelpIcon },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/pump');
  return pathname.startsWith(href);
}

/** Desktop links in the header. */
export function HeaderLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden flex-1 flex-wrap gap-1 md:flex">
      {NAV.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3.5 py-2 text-[15px] no-underline ${
              active ? 'bg-pal-50 font-semibold text-pal-700' : 'font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar on phones. */
export function TabBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV.map(({ href, short, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] no-underline ${
              active ? 'font-bold text-pal-700' : 'font-medium text-stone-600 hover:text-stone-900'
            }`}
          >
            <Icon />
            {short}
          </Link>
        );
      })}
    </nav>
  );
}
