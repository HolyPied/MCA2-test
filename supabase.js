// ── Supabase Client ──────────────────────────────────────────
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = 'https://hjaywokvgdzhvsoygctc.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_4lPs4a1t0cOdDRZ1VTpMpQ_fC2dHV_T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth helpers ─────────────────────────────────────────────

/** Returns the current session user, or null */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Returns the profile row for a given user id, or null */
export async function getProfile(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

/** Returns true if the current user has role = 'admin' */
export async function isAdmin(userId) {
  const profile = await getProfile(userId);
  return profile?.role === 'admin';
}

/** Sign in with Discord OAuth */
export async function signInWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: window.location.origin + '/shop.html' }
  });
  if (error) console.error('Discord sign-in error:', error.message);
}

/** Sign in with email + password */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  await supabase.auth.signOut();
}
