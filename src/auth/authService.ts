import { requireSupabase } from '../lib/supabase';
import { clearUserWorkoutStorage } from '../workouts/workoutStorage';

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

export async function deleteAccount(): Promise<void> {
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session) {
    throw new Error('Your session has expired. Please sign in again before deleting your account.');
  }

  const { error } = await client.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw new Error('We could not delete your account. Check your connection and try again.');
  }

  try {
    await clearUserWorkoutStorage(session.user.id);
  } catch (storageError) {
    console.warn('Account deleted, but local workout data could not be cleared.', storageError);
  }

  const { error: signOutError } = await client.auth.signOut({ scope: 'local' });
  if (signOutError) {
    console.warn('Account deleted, but the local session could not be cleared normally.', signOutError);
  }
}
