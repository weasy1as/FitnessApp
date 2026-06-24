export type ProgressTimeframe = '8w' | '30d';

export type ProgressSetHistoryItem = {
  exerciseId: string | null;
  exerciseName: string;
  primaryMuscle: string | null;
  startedAt: string;
  weightKg: number;
  reps: number;
  setPosition: number;
};

export type ExerciseProgressPoint = {
  key: string;
  exerciseKey: string;
  exerciseName: string;
  primaryMuscle: string | null;
  startedAt: string;
  weightKg: number;
  reps: number;
  isPr: boolean;
};

export type ExerciseProgressSummary = {
  exerciseKey: string;
  exerciseName: string;
  primaryMuscle: string | null;
  earliestTopWeightKg: number;
  latestTopWeightKg: number;
  increaseKg: number;
  firstSeenAt: string;
  latestSeenAt: string;
};

export type RecentPr = {
  exerciseKey: string;
  exerciseName: string;
  primaryMuscle: string | null;
  startedAt: string;
  weightKg: number;
  reps: number;
};

export type MuscleGroupSummary = {
  muscle: string;
  improvingExercises: number;
  totalIncreaseKg: number;
  exercises: ExerciseProgressSummary[];
};
