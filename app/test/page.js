import Link from 'next/link';
import TestFlow from '@/components/TestFlow';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Upload a test',
  description: 'Scan the QR code on your Petrol Pal tester to add your fuel test to the map.',
};

export default function TestPage({ searchParams }) {
  const code = typeof searchParams?.c === 'string' ? searchParams.c : '';
  const pump = typeof searchParams?.pump === 'string' ? searchParams.pump : '';
  return (
    <>
      <main className="page flex max-w-[640px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight">Upload a test</h1>
          <p className="text-stone-600">Three quick steps. No account needed.</p>
        </div>
        <TestFlow initialCode={code} initialPumpId={pump} />
        <p className="text-[13px] text-stone-600">
          We use your location only to match the pump and check you were there. <Link href="/privacy">Privacy</Link> ·{' '}
          <Link href="/get">Don’t have a tester yet?</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
