import type {
  ExerciseProgressPoint,
  ExerciseProgressSummary,
  ProgressSetHistoryItem,
  RecentPr,
} from "../types/progress";

export function getExerciseProgressKey(
  set: Pick<ProgressSetHistoryItem, "exerciseId" | "exerciseName">,
) {
  return set.exerciseId ?? normalizeExerciseName(set.exerciseName);
}

export function buildSelectedExerciseWeightHistory(
  timeframeSets: ProgressSetHistoryItem[],
  allTimeSets: ProgressSetHistoryItem[],
  exerciseKey: string,
): ExerciseProgressPoint[] {
  const prKeys = getRecordBreakingSetKeys(allTimeSets);
  const topSets = getTopSetPerWorkout(timeframeSets).filter(
    (set) => set.exerciseKey === exerciseKey,
  );
  return topSets.map((set) => ({
    key: set.exerciseKey + "-" + set.startedAt,
    exerciseKey: set.exerciseKey,
    exerciseName: set.exerciseName,
    primaryMuscle: set.primaryMuscle,
    startedAt: set.startedAt,
    weightKg: set.weightKg,
    reps: set.reps,
    isPr: prKeys.has(createSetIdentity(set)),
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
    .sort(
      (a, b) =>
        b.increaseKg - a.increaseKg ||
        a.exerciseName.localeCompare(b.exerciseName),
    );
}

export function findRecentPrs(
  timeframeSets: ProgressSetHistoryItem[],
  allTimeSets: ProgressSetHistoryItem[],
): RecentPr[] {
  const prKeys = getRecordBreakingSetKeys(allTimeSets);
  const timeframeKeys = new Set(timeframeSets.map(createSetIdentity));
  return [...allTimeSets]
    .filter((set) => {
      const setKey = createSetIdentity(set);
      return timeframeKeys.has(setKey) && prKeys.has(setKey);
    })
    .map((set) => ({
      exerciseKey: getExerciseProgressKey(set),
      exerciseName: set.exerciseName,
      primaryMuscle: set.primaryMuscle,
      startedAt: set.startedAt,
      weightKg: set.weightKg,
      reps: set.reps,
    }))
    .sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
}

export function getExerciseOptions(summaries: ExerciseProgressSummary[]) {
  return [...summaries].sort((a, b) =>
    a.exerciseName.localeCompare(b.exerciseName),
  );
}

type TopWorkoutSet = ProgressSetHistoryItem & { exerciseKey: string };

function getTopSetPerWorkout(sets: ProgressSetHistoryItem[]): TopWorkoutSet[] {
  const topSets = new Map<string, TopWorkoutSet>();
  sets.forEach((set) => {
    const exerciseKey = getExerciseProgressKey(set);
    const key = exerciseKey + "-" + set.startedAt;
    const current = topSets.get(key);
    if (
      !current ||
      set.weightKg > current.weightKg ||
      (set.weightKg === current.weightKg && set.reps > current.reps)
    ) {
      topSets.set(key, { ...set, exerciseKey });
    }
  });
  return [...topSets.values()].sort(compareByStartedAt);
}

function groupTopSetsByExercise(sets: TopWorkoutSet[]) {
  const grouped = new Map<string, TopWorkoutSet[]>();
  sets.forEach((set) => {
    grouped.set(set.exerciseKey, [
      ...(grouped.get(set.exerciseKey) ?? []),
      set,
    ]);
  });
  return grouped;
}

function getRecordBreakingSetKeys(sets: ProgressSetHistoryItem[]) {
  const previousBestByExercise = new Map<string, number>();
  const prKeys = new Set<string>();

  [...sets].sort(compareRawSetByStartedAt).forEach((set) => {
    const exerciseKey = getExerciseProgressKey(set);
    const previousBest = previousBestByExercise.get(exerciseKey);
    if (previousBest === undefined) {
      previousBestByExercise.set(exerciseKey, set.weightKg);
      return;
    }

    if (set.weightKg > previousBest) {
      previousBestByExercise.set(exerciseKey, set.weightKg);
      prKeys.add(createSetIdentity(set));
    }
  });

  return prKeys;
}

function normalizeExerciseName(name: string) {
  return "name:" + name.trim().toLowerCase();
}

function createSetIdentity(set: ProgressSetHistoryItem) {
  return [
    getExerciseProgressKey(set),
    set.startedAt,
    set.setPosition,
    set.weightKg,
    set.reps,
  ].join("|");
}

function compareByStartedAt(
  a: { startedAt: string },
  b: { startedAt: string },
) {
  return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
}

function compareRawSetByStartedAt(
  a: ProgressSetHistoryItem,
  b: ProgressSetHistoryItem,
) {
  return compareByStartedAt(a, b) || a.setPosition - b.setPosition;
}
