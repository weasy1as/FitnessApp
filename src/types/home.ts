export type WorkoutExerciseSummary = {
  id: string;
  name: string;
  weightKg: number;
  reps: number;
};

export type LastWorkoutSummary = {
  name: string;
  dateLabel: string;
  exercises: WorkoutExerciseSummary[];
};

export type AchievementSummary = {
  exerciseName: string;
  improvementKg: number;
  label: string;
};

export type HomeDashboardData = {
  lastWorkout: LastWorkoutSummary;
  achievement: AchievementSummary;
};
