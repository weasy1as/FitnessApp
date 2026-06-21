import type { HomeDashboardData } from '../types/home';

export const homeDashboardData: HomeDashboardData = {
  completedSessions: 3,
  weeklyGoal: 4,
  lastWorkout: {
    name: 'Upper Body A',
    dateLabel: '2 days ago',
    exercises: [
      { id: 'bench-press', name: 'Bench Press', weightKg: 100, reps: 5 },
      { id: 'barbell-row', name: 'Barbell Row', weightKg: 85, reps: 8 },
      { id: 'overhead-press', name: 'Overhead Press', weightKg: 60, reps: 6 },
    ],
  },
  achievement: {
    exerciseName: 'Bench Press',
    improvementKg: 2.5,
    label: 'PB',
  },
};
