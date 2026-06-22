import { requireSupabase } from '../lib/supabase';
import { filterCompletedExercises } from '../lib/workout';
import type { CompletedWorkout } from '../types/workout';

type WorkoutSetRow = {
  id: string;
  position: number;
  weight_kg: number | string;
  reps: number;
};

type WorkoutExerciseRow = {
  id: string;
  exercise_id: string | null;
  exercise_name: string;
  position: number;
  workout_sets: WorkoutSetRow[];
};

type WorkoutRow = {
  id: string;
  client_id: string;
  name: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  workout_exercises: WorkoutExerciseRow[];
};

type CompletedWorkoutPayload = {
  clientId: string;
  name: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: {
    exerciseId: string | null;
    name: string;
    sets: { weightKg: number; reps: number }[];
  }[];
};

export async function loadCloudWorkouts(userId: string): Promise<{ workout: CompletedWorkout; serverId: string }[]> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .select(`
      id,
      client_id,
      name,
      started_at,
      completed_at,
      duration_seconds,
      workout_exercises (
        id,
        exercise_id,
        exercise_name,
        position,
        workout_sets (id, position, weight_kg, reps)
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as WorkoutRow[]).map((row) => ({
    serverId: row.id,
    workout: mapWorkoutRow(row),
  }));
}

export async function uploadCompletedWorkout(workout: CompletedWorkout): Promise<string> {
  const completedExercises = filterCompletedExercises(workout.exercises);
  const payload: CompletedWorkoutPayload = {
    clientId: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    durationSeconds: workout.durationSeconds,
    exercises: completedExercises.map((exercise) => ({
      exerciseId: exercise.catalogExerciseId ?? null,
      name: exercise.name,
      sets: exercise.sets.map((set) => ({ weightKg: set.weightKg, reps: set.reps })),
    })),
  };
  const { data, error } = await requireSupabase().rpc('save_completed_workout', {
    p_workout: payload,
  });

  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Supabase did not return a workout ID.');
  return data;
}

function mapWorkoutRow(row: WorkoutRow): CompletedWorkout {
  return {
    id: row.client_id,
    status: 'completed',
    name: row.name,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    exercises: [...row.workout_exercises]
      .sort((a, b) => a.position - b.position)
      .map((exercise) => ({
        id: exercise.id,
        catalogExerciseId: exercise.exercise_id ?? undefined,
        name: exercise.exercise_name,
        sets: [...exercise.workout_sets]
          .sort((a, b) => a.position - b.position)
          .map((set) => ({
            id: set.id,
            weightKg: Number(set.weight_kg),
            reps: set.reps,
            completed: true,
          })),
      })),
  };
}
