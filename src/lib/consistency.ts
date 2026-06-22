import type { WeeklyConsistency } from '../types/consistency';
import type { CompletedWorkout } from '../types/workout';

const ROLLING_WINDOW_DAYS = 7;

export function calculateWeeklyConsistency(
  workouts: CompletedWorkout[],
  now = new Date(),
): WeeklyConsistency {
  const today = startOfLocalDay(now);
  const workoutDateKeys = new Set(
    workouts
      .map((workout) => new Date(workout.completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(toLocalDateKey),
  );

  const days = Array.from({ length: ROLLING_WINDOW_DAYS }, (_, index) => {
    const daysAgo = ROLLING_WINDOW_DAYS - 1 - index;
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    const dateKey = toLocalDateKey(date);
    return {
      dateKey,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(date),
      hasWorkout: workoutDateKeys.has(dateKey),
      isToday: daysAgo === 0,
    };
  });

  return {
    completedDays: days.filter((day) => day.hasWorkout).length,
    days,
  };
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
