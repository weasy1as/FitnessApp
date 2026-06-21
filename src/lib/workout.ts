import type { ActiveWorkout, WorkoutExercise, WorkoutSet } from '../types/workout';

const exerciseCatalog = [
  { name: 'Bench Press (Barbell)', lastPerformance: '75kg x 5', personalBestKg: 80, suggestedKg: 77.5, reps: 5 },
  { name: 'Barbell Row', lastPerformance: '82.5kg x 8', personalBestKg: 85, suggestedKg: 85, reps: 8 },
  { name: 'Overhead Press', lastPerformance: '57.5kg x 6', personalBestKg: 60, suggestedKg: 60, reps: 6 },
];

export function createId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function createExercise(index: number): WorkoutExercise {
  const template = exerciseCatalog[index % exerciseCatalog.length];
  return {
    id: createId('exercise'),
    name: template.name,
    lastPerformance: template.lastPerformance,
    personalBestKg: template.personalBestKg,
    sets: [createSet(template.suggestedKg, template.reps)],
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
    exercises: [createExercise(0)],
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
