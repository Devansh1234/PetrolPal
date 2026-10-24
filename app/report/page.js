import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ReportForm from '@/components/ReportForm';
import Footer from '@/components/Footer';

export const metadata = { title: 'Contact us or report a pump', robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReportPage({ searchParams }) {
  const pumpId = typeof searchParams?.pump === 'string' && UUID.test(searchParams.pump) ? searchParams.pump : null;
  const kind = typeof searchParams?.kind === 'string' ? searchParams.kind : undefined;
  const pump = pumpId ? (await createClient().rpc('pump_detail', { p_id: pumpId })).data : null;

  return (
    <>
      <main className="page flex max-w-[640px] flex-col gap-5">
        {pump && (
          <Link href={`/pump/${pump.id}`} className="text-sm font-semibold no-underline">
            ← {pump.name}
            {pump.city ? `, ${pump.city}` : ''}
          </Link>
        )}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight">{pump ? 'Tell us about this pump' : 'Contact Petrol Pal'}</h1>
          <p className="text-stone-600">Only the Petrol Pal team sees this. Nothing here is published.</p>
        </div>
        <ReportForm pumpId={pump?.id || null} initialKind={kind} />
      </main>
      <Footer />
    </>
  );
}
