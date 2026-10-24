import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function cell(v) {
  const s = v == null ? '' : String(v);
  // Quote, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) return new NextResponse('Not found', { status: 404 });

  const { data } = await supabase.from('waitlist').select('created_at, name, phone, email, city, interest').order('created_at');
  const header = ['Joined', 'Name', 'Phone', 'Email', 'City', 'Interested in'];
  const lines = [header.map(cell).join(',')].concat(
    (data || []).map((r) => [new Date(r.created_at).toISOString().slice(0, 10), r.name, r.phone, r.email, r.city, r.interest].map(cell).join(',')),
  );
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="petrolpal-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
