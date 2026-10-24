import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white px-5 pb-24 pt-5 text-[13px] text-stone-600 md:px-7 md:pb-5">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <span>© {new Date().getFullYear()} Petrol Pal</span>
        <Link href="/how">How it works</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/grievance">Grievance officer</Link>
        <Link href="/report">Contact us</Link>
      </div>
      <p className="mt-2 text-stone-500">
        Pump locations © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL).
      </p>
    </footer>
  );
}
