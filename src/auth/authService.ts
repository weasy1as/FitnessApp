import { requireSupabase } from '../lib/supabase';

export async function signIn(email: string, password: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signUp(firstName: string, lastName: string, email: string, password: string) {
  const first = firstName.trim();
  const last = lastName.trim();
  const { data, error } = await requireSupabase().auth.signUp({
    email: email.trim(), password,
    options: { data: { first_name: first, last_name: last, full_name: first + ' ' + last } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
