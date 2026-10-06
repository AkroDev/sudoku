import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './supabase-browser';

export type MagicLinkResult =
  | { sent: true }
  | { sent: false; reason: 'not-configured' | 'failed'; error?: string };

export function subscribeToSupabaseSession(onSession: (session: Session | null) => void) {
  const client = getSupabaseBrowserClient();
  if (!client) return () => {};

  void client.auth.getSession().then(({ data }) => onSession(data.session));
  const { data } = client.auth.onAuthStateChange((_event, session) => onSession(session));

  return () => data.subscription.unsubscribe();
}

export async function sendMagicLink(email: string): Promise<MagicLinkResult> {
  const client = getSupabaseBrowserClient();
  if (!client) return { sent: false, reason: 'not-configured' };

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  return error
    ? { sent: false, reason: 'failed', error: error.message }
    : { sent: true };
}

export async function signOutFromSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
}
