export type WeeklyConsistencyDay = {
  dateKey: string;
  label: string;
  hasWorkout: boolean;
  isToday: boolean;
};

export type WeeklyConsistency = {
  completedDays: number;
  days: WeeklyConsistencyDay[];
};
