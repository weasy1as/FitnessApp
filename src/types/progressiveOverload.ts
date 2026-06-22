export type PreviousPerformanceSet = {
  weightKg: number;
  reps: number;
};

export type PreviousExercisePerformance = {
  exerciseId: string;
  exerciseName: string;
  workoutId: string;
  completedAt: string;
  sets: PreviousPerformanceSet[];
  topSet: PreviousPerformanceSet;
};

export type ProgressiveOverloadSuggestion = {
  exerciseId: string;
  previousWeightKg: number;
  suggestedWeightKg: number;
};

export type ExerciseProgression = {
  previousPerformance: PreviousExercisePerformance;
  suggestion?: ProgressiveOverloadSuggestion;
};
