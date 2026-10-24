'use client';
import { createBrowserClient } from '@supabase/ssr';

let client;

/** Supabase client for use in the browser (client components). */
export function createClient() {
  if (!client) {
    client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return client;
}
