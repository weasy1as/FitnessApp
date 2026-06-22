export type WorkoutSet = {
  id: string;
  weightKg: number;
  reps: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  catalogExerciseId?: string;
  name: string;
  primaryMuscle?: string | null;
  equipment?: string | null;
  imageUrl?: string | null;
  sets: WorkoutSet[];
};

export type ActiveWorkout = {
  id: string;
  status: 'active';
  name: string;
  startedAt: string;
  exercises: WorkoutExercise[];
};

export type CompletedWorkout = {
  id: string;
  status: 'completed';
  name: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: WorkoutExercise[];
};
