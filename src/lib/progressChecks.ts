import {
  buildSelectedExerciseWeightHistory,
  calculateExerciseProgressSummaries,
  findRecentPrs,
  getExerciseProgressKey,
} from './progress';
import type { ProgressSetHistoryItem } from '../types/progress';

export function runProgressCalculationSampleChecks() {
  const sets: ProgressSetHistoryItem[] = [
    createSet('bench-id', 'Bench Press', 'Chest', '2026-05-01T10:00:00.000Z', 80, 5, 0),
    createSet('bench-id', 'Bench Press', 'Chest', '2026-05-10T10:00:00.000Z', 85, 4, 0),
    createSet(null, 'Cable Row', 'Back', '2026-05-02T10:00:00.000Z', 60, 8, 0),
    createSet(null, 'Cable Row', 'Back', '2026-05-11T10:00:00.000Z', 65, 8, 0),
  ];
  const benchKey = getExerciseProgressKey(sets[0]);
  const rowKey = getExerciseProgressKey(sets[2]);
  const summaries = calculateExerciseProgressSummaries(sets);
  const benchHistory = buildSelectedExerciseWeightHistory(sets, sets, benchKey);
  const prs = findRecentPrs(sets.slice(1), sets);

  assert(benchHistory.length === 2, 'selected exercise history uses top sets per workout');
  assert(summaries.find((summary) => summary.exerciseKey === benchKey)?.increaseKg === 5, 'bench progress is +5 kg');
  assert(summaries.find((summary) => summary.exerciseKey === rowKey)?.increaseKg === 5, 'name fallback progress is +5 kg');
  assert(prs.some((pr) => pr.exerciseName === 'Bench Press' && pr.weightKg === 85), 'recent PRs compare against all-time history');
}

function createSet(
  exerciseId: string | null,
  exerciseName: string,
  primaryMuscle: string | null,
  startedAt: string,
  weightKg: number,
  reps: number,
  setPosition: number,
): ProgressSetHistoryItem {
  return { exerciseId, exerciseName, primaryMuscle, startedAt, weightKg, reps, setPosition };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error('Progress calculation sample check failed: ' + message);
}
