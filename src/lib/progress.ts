import type {
  ExerciseProgressPoint,
  ExerciseProgressSummary,
  MuscleGroupSummary,
  ProgressSetHistoryItem,
  RecentPr,
} from '../types/progress';

export function getExerciseProgressKey(set: Pick<ProgressSetHistoryItem, 'exerciseId' | 'exerciseName'>) {
  return set.exerciseId ?? normalizeExerciseName(set.exerciseName);
}

export function buildSelectedExerciseWeightHistory(
  timeframeSets: ProgressSetHistoryItem[],
  allTimeSets: ProgressSetHistoryItem[],
  exerciseKey: string,
): ExerciseProgressPoint[] {
  const allTimePr = getAllTimePrWeightByExercise(allTimeSets).get(exerciseKey) ?? 0;
  const topSets = getTopSetPerWorkout(timeframeSets).filter((set) => set.exerciseKey === exerciseKey);
  return topSets.map((set) => ({
    key: set.exerciseKey + '-' + set.startedAt,
    exerciseKey: set.exerciseKey,
    exerciseName: set.exerciseName,
    primaryMuscle: set.primaryMuscle,
    startedAt: set.startedAt,
    weightKg: set.weightKg,
    reps: set.reps,
    isPr: set.weightKg >= allTimePr && allTimePr > 0,
  }));
}

export function calculateExerciseProgressSummaries(
  timeframeSets: ProgressSetHistoryItem[],
): ExerciseProgressSummary[] {
  const grouped = groupTopSetsByExercise(getTopSetPerWorkout(timeframeSets));

  return [...grouped.values()]
    .map((sets) => {
      const sorted = [...sets].sort(compareByStartedAt);
      const first = sorted[0];
      const latest = sorted[sorted.length - 1];
      return {
        exerciseKey: first.exerciseKey,
        exerciseName: first.exerciseName,
        primaryMuscle: first.primaryMuscle,
        earliestTopWeightKg: first.weightKg,
        latestTopWeightKg: latest.weightKg,
        increaseKg: latest.weightKg - first.weightKg,
        firstSeenAt: first.startedAt,
        latestSeenAt: latest.startedAt,
      };
    })
    .sort((a, b) => b.increaseKg - a.increaseKg || a.exerciseName.localeCompare(b.exerciseName));
}

export function findRecentPrs(
  timeframeSets: ProgressSetHistoryItem[],
  allTimeSets: ProgressSetHistoryItem[],
): RecentPr[] {
  const previousBestByExercise = new Map<string, number>();
  const timeframeKeys = new Set(timeframeSets.map(createSetIdentity));
  const prs: RecentPr[] = [];

  [...allTimeSets].sort(compareRawSetByStartedAt).forEach((set) => {
    const exerciseKey = getExerciseProgressKey(set);
    const previousBest = previousBestByExercise.get(exerciseKey) ?? -1;
    if (set.weightKg > previousBest) {
      previousBestByExercise.set(exerciseKey, set.weightKg);
      if (timeframeKeys.has(createSetIdentity(set))) {
        prs.push({
          exerciseKey,
          exerciseName: set.exerciseName,
          primaryMuscle: set.primaryMuscle,
          startedAt: set.startedAt,
          weightKg: set.weightKg,
          reps: set.reps,
        });
      }
    }
  });

  return prs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function summarizeMuscleGroups(summaries: ExerciseProgressSummary[]): MuscleGroupSummary[] {
  const grouped = new Map<string, ExerciseProgressSummary[]>();
  summaries.forEach((summary) => {
    const muscle = summary.primaryMuscle ?? 'Unassigned';
    grouped.set(muscle, [...(grouped.get(muscle) ?? []), summary]);
  });

  return [...grouped.entries()]
    .map(([muscle, exercises]) => {
      const improvingExercises = exercises.filter((exercise) => exercise.increaseKg > 0);
      return {
        muscle,
        improvingExercises: improvingExercises.length,
        totalIncreaseKg: improvingExercises.reduce((total, exercise) => total + exercise.increaseKg, 0),
        exercises: improvingExercises.sort((a, b) => b.increaseKg - a.increaseKg),
      };
    })
    .filter((summary) => summary.improvingExercises > 0)
    .sort((a, b) => b.improvingExercises - a.improvingExercises || b.totalIncreaseKg - a.totalIncreaseKg);
}

export function getExerciseOptions(summaries: ExerciseProgressSummary[]) {
  return [...summaries].sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

type TopWorkoutSet = ProgressSetHistoryItem & { exerciseKey: string };

function getTopSetPerWorkout(sets: ProgressSetHistoryItem[]): TopWorkoutSet[] {
  const topSets = new Map<string, TopWorkoutSet>();
  sets.forEach((set) => {
    const exerciseKey = getExerciseProgressKey(set);
    const key = exerciseKey + '-' + set.startedAt;
    const current = topSets.get(key);
    if (!current || set.weightKg > current.weightKg || (set.weightKg === current.weightKg && set.reps > current.reps)) {
      topSets.set(key, { ...set, exerciseKey });
    }
  });
  return [...topSets.values()].sort(compareByStartedAt);
}

function groupTopSetsByExercise(sets: TopWorkoutSet[]) {
  const grouped = new Map<string, TopWorkoutSet[]>();
  sets.forEach((set) => {
    grouped.set(set.exerciseKey, [...(grouped.get(set.exerciseKey) ?? []), set]);
  });
  return grouped;
}

function getAllTimePrWeightByExercise(sets: ProgressSetHistoryItem[]) {
  const prs = new Map<string, number>();
  sets.forEach((set) => {
    const exerciseKey = getExerciseProgressKey(set);
    const current = prs.get(exerciseKey) ?? 0;
    if (set.weightKg > current) prs.set(exerciseKey, set.weightKg);
  });
  return prs;
}

function normalizeExerciseName(name: string) {
  return 'name:' + name.trim().toLowerCase();
}

function createSetIdentity(set: ProgressSetHistoryItem) {
  return [getExerciseProgressKey(set), set.startedAt, set.setPosition, set.weightKg, set.reps].join('|');
}

function compareByStartedAt(a: { startedAt: string }, b: { startedAt: string }) {
  return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
}

function compareRawSetByStartedAt(a: ProgressSetHistoryItem, b: ProgressSetHistoryItem) {
  return compareByStartedAt(a, b) || a.setPosition - b.setPosition;
}
