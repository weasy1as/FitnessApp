import { requireSupabase } from '../lib/supabase';

type FavoriteWorkoutRow = { workout_client_id: string };

export async function loadFavoriteWorkoutIds(userId: string): Promise<string[]> {
  const { data, error } = await requireSupabase()
    .from('favorite_workouts')
    .select('workout_client_id')
    .eq('user_id', userId);

  if (error) throw error;
  return ((data ?? []) as FavoriteWorkoutRow[]).map((row) => row.workout_client_id);
}

export async function saveFavoriteWorkout(
  userId: string,
  workoutId: string,
  enabled: boolean,
): Promise<void> {
  const client = requireSupabase().from('favorite_workouts');
  const result = enabled
    ? await client.insert({ user_id: userId, workout_client_id: workoutId })
    : await client.delete().eq('user_id', userId).eq('workout_client_id', workoutId);

  if (result.error) throw result.error;
}
