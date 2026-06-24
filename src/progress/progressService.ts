import { requireSupabase } from '../lib/supabase';
import type { ProgressSetHistoryItem, ProgressTimeframe } from '../types/progress';

type WorkoutSetRow = {
  position: number;
  weight_kg: number | string;
  reps: number;
};

type WorkoutExerciseRow = {
  exercise_id: string | null;
  exercise_name: string;
  exercises: { primary_muscle: string | null } | { primary_muscle: string | null }[] | null;
  workout_sets: WorkoutSetRow[];
};

type WorkoutHistoryRow = {
  started_at: string;
  workout_exercises: WorkoutExerciseRow[];
};

const TIMEFRAME_DAYS: Record<ProgressTimeframe, number> = {
  '8w': 56,
  '30d': 30,
};

export function getProgressTimeframeStart(timeframe: ProgressTimeframe, now = new Date()) {
  const start = new Date(now);
  start.setDate(start.getDate() - TIMEFRAME_DAYS[timeframe]);
  return start.toISOString();
}

export async function loadProgressSetHistory(
  userId: string,
  timeframe: ProgressTimeframe,
): Promise<{ timeframeSets: ProgressSetHistoryItem[]; allTimeSets: ProgressSetHistoryItem[] }> {
  const allTimeSets = await loadProgressRows(userId);
  const timeframeStart = getProgressTimeframeStart(timeframe);
  return {
    allTimeSets,
    timeframeSets: allTimeSets.filter((set) => set.startedAt >= timeframeStart),
  };
}

async function loadProgressRows(userId: string): Promise<ProgressSetHistoryItem[]> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .select(`
      started_at,
      workout_exercises (
        exercise_id,
        exercise_name,
        exercises (primary_muscle),
        workout_sets (position, weight_kg, reps)
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: true });

  if (error) throw error;
  return mapProgressRows((data ?? []) as WorkoutHistoryRow[]);
}

function mapProgressRows(rows: WorkoutHistoryRow[]): ProgressSetHistoryItem[] {
  return rows.flatMap((workout) =>
    workout.workout_exercises.flatMap((exercise) =>
      exercise.workout_sets.map((set) => ({
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise_name,
        primaryMuscle: getPrimaryMuscle(exercise.exercises),
        startedAt: workout.started_at,
        weightKg: Number(set.weight_kg),
        reps: set.reps,
        setPosition: set.position,
      })),
    ),
  );
}

function getPrimaryMuscle(
  exercise: { primary_muscle: string | null } | { primary_muscle: string | null }[] | null,
) {
  if (Array.isArray(exercise)) return exercise[0]?.primary_muscle ?? null;
  return exercise?.primary_muscle ?? null;
}
