export type PersonalBest = {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
};

export type PersonalBestAchievement = {
  workoutId: string;
  completedAt: string;
  exerciseId: string;
  exerciseName: string;
  previousWeightKg: number;
  weightKg: number;
  improvementKg: number;
};
