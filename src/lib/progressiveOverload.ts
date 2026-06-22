import type {
  ExerciseProgression,
  PreviousExercisePerformance,
  PreviousPerformanceSet,
  ProgressiveOverloadSuggestion,
} from '../types/progressiveOverload';
import type { CompletedWorkout } from '../types/workout';

const MAX_SESSION_GAP_DAYS = 10;
const WEIGHT_INCREMENT_KG = 2.5;

export function calculateExerciseProgressions(
  workouts: CompletedWorkout[],
  now = new Date(),
): Map<string, ExerciseProgression> {
  const sessionsByExercise = new Map<string, PreviousExercisePerformance[]>();

  sortValidWorkoutsNewestFirst(workouts).forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const exerciseId = exercise.catalogExerciseId;
      if (!exerciseId) return;

      const existingSessions = sessionsByExercise.get(exerciseId) ?? [];
      if (existingSessions.length >= 2) return;

      const sets = exercise.sets
        .filter((set) => set.completed)
        .map(({ weightKg, reps }) => ({ weightKg, reps }));
      const topSet = getTopSet(sets);
      if (!topSet) return;

      existingSessions.push({
        exerciseId,
        exerciseName: exercise.name,
        workoutId: workout.id,
        completedAt: workout.completedAt,
        sets,
        topSet,
      });
      sessionsByExercise.set(exerciseId, existingSessions);
    });
  });

  const progressions = new Map<string, ExerciseProgression>();
  sessionsByExercise.forEach(([latest, previous], exerciseId) => {
    if (!latest) return;
    progressions.set(exerciseId, {
      previousPerformance: latest,
      suggestion: previous ? getSuggestion(latest, previous, now) : undefined,
    });
  });
  return progressions;
}

export function formatShortPerformanceDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(isoDate),
  );
}

function getSuggestion(
  latest: PreviousExercisePerformance,
  previous: PreviousExercisePerformance,
  now: Date,
): ProgressiveOverloadSuggestion | undefined {
  const latestDate = new Date(latest.completedAt);
  const previousDate = new Date(previous.completedAt);
  const daysSinceLatest = differenceInLocalCalendarDays(now, latestDate);
  const daysBetweenSessions = differenceInLocalCalendarDays(latestDate, previousDate);

  if (
    daysSinceLatest < 0 ||
    daysSinceLatest > MAX_SESSION_GAP_DAYS ||
    daysBetweenSessions < 0 ||
    daysBetweenSessions > MAX_SESSION_GAP_DAYS ||
    latest.topSet.weightKg <= 0 ||
    latest.topSet.weightKg < previous.topSet.weightKg ||
    latest.topSet.reps < previous.topSet.reps
  ) {
    return undefined;
  }

  return {
    exerciseId: latest.exerciseId,
    previousWeightKg: latest.topSet.weightKg,
    suggestedWeightKg: latest.topSet.weightKg + WEIGHT_INCREMENT_KG,
  };
}

function getTopSet(sets: PreviousPerformanceSet[]): PreviousPerformanceSet | undefined {
  return sets.reduce<PreviousPerformanceSet | undefined>((topSet, set) => {
    if (!topSet || set.weightKg > topSet.weightKg) return set;
    if (set.weightKg === topSet.weightKg && set.reps > topSet.reps) return set;
    return topSet;
  }, undefined);
}

function sortValidWorkoutsNewestFirst(workouts: CompletedWorkout[]) {
  return workouts
    .map((workout) => ({ workout, timestamp: new Date(workout.completedAt).getTime() }))
    .filter(({ timestamp }) => Number.isFinite(timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(({ workout }) => workout);
}

function differenceInLocalCalendarDays(later: Date, earlier: Date): number {
  return localDayNumber(later) - localDayNumber(earlier);
}

function localDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}
