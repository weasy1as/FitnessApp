import type { ExerciseCatalogItem } from '../types/exercise';
import type { ActiveWorkout, WorkoutExercise, WorkoutSet } from '../types/workout';

export function createId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function createExercise(exercise: ExerciseCatalogItem): WorkoutExercise {
  return {
    id: createId('exercise'),
    catalogExerciseId: exercise.id,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
    imageUrl: exercise.imageUrl,
    sets: [createSet()],
  };
}

export function createSet(weightKg = 0, reps = 0): WorkoutSet {
  return {
    id: createId('set'),
    weightKg,
    reps,
    completed: false,
  };
}

export function createWorkoutDraft(): ActiveWorkout {
  return {
    id: createId('workout'),
    status: 'active',
    name: 'Workout Session',
    startedAt: new Date().toISOString(),
    exercises: [],
  };
}

export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}

export function formatWorkoutDuration(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes < 60) return minutes + ' min';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? hours + 'h ' + remainder + 'm' : hours + 'h';
}

export function formatWorkoutDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function countCompletedSets(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  );
}

export function filterCompletedExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .map((exercise) => ({
      ...exercise,
      sets: exercise.sets.filter((set) => set.completed),
    }))
    .filter((exercise) => exercise.sets.length > 0);
}
