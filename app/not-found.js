import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-stone-600">This page or pump doesn’t exist, or it may have been removed.</p>
      <Link href="/" className="btn-primary">
        Back to the map
      </Link>
    </main>
  );
}
