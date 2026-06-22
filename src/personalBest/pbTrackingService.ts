import { requireSupabase } from '../lib/supabase';

type TrackedExerciseRow = { exercise_id: string };

export async function loadTrackedPbExerciseIds(userId: string): Promise<string[]> {
  const { data, error } = await requireSupabase()
    .from('pb_tracked_exercises')
    .select('exercise_id')
    .eq('user_id', userId);

  if (error) throw error;
  return ((data ?? []) as TrackedExerciseRow[]).map((row) => row.exercise_id);
}

export async function savePbTracking(
  userId: string,
  exerciseId: string,
  enabled: boolean,
): Promise<void> {
  const client = requireSupabase().from('pb_tracked_exercises');
  const result = enabled
    ? await client.insert({ user_id: userId, exercise_id: exerciseId })
    : await client.delete().eq('user_id', userId).eq('exercise_id', exerciseId);

  if (result.error) throw result.error;
}
