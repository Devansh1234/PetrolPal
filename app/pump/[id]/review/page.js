import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewForm from '@/components/ReviewForm';

export const metadata = { title: 'Write a review', robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReviewPage({ params }) {
  if (!UUID.test(params.id)) notFound();
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect(`/signin?next=/pump/${params.id}/review`);

  const { data: pump } = await supabase.rpc('pump_detail', { p_id: params.id });
  if (!pump) notFound();

  return (
    <main className="page flex max-w-[640px] flex-col gap-5">
      <Link href={`/pump/${pump.id}`} className="text-sm font-semibold no-underline">
        ← {pump.name}
        {pump.city ? `, ${pump.city}` : ''}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">How was your visit?</h1>
      <ReviewForm pumpId={pump.id} />
    </main>
  );
}
