import type { CompletedWorkout } from '../types/workout';

export const dummyWorkoutHistory: CompletedWorkout[] = [
  {
    id: 'history-upper-a',
    status: 'completed',
    name: 'Upper Body A',
    startedAt: '2026-06-18T15:30:00.000Z',
    completedAt: '2026-06-18T16:24:00.000Z',
    durationSeconds: 3240,
    exercises: [
      {
        id: 'history-bench',
        name: 'Bench Press',
        lastPerformance: '97.5kg x 5',
        personalBestKg: 100,
        sets: [
          { id: 'history-bench-1', weightKg: 100, reps: 5, completed: true },
          { id: 'history-bench-2', weightKg: 97.5, reps: 6, completed: true },
        ],
      },
      {
        id: 'history-row',
        name: 'Barbell Row',
        lastPerformance: '82.5kg x 8',
        personalBestKg: 85,
        sets: [{ id: 'history-row-1', weightKg: 85, reps: 8, completed: true }],
      },
    ],
  },
  {
    id: 'history-lower-a',
    status: 'completed',
    name: 'Lower Body A',
    startedAt: '2026-06-15T14:00:00.000Z',
    completedAt: '2026-06-15T15:06:00.000Z',
    durationSeconds: 3960,
    exercises: [
      {
        id: 'history-squat',
        name: 'Low Bar Squat',
        lastPerformance: '120kg x 5',
        personalBestKg: 125,
        sets: [
          { id: 'history-squat-1', weightKg: 125, reps: 5, completed: true },
          { id: 'history-squat-2', weightKg: 120, reps: 5, completed: true },
        ],
      },
      {
        id: 'history-rdl',
        name: 'Romanian Deadlift',
        lastPerformance: '100kg x 8',
        sets: [{ id: 'history-rdl-1', weightKg: 105, reps: 8, completed: true }],
      },
    ],
  },
  {
    id: 'history-upper-b',
    status: 'completed',
    name: 'Upper Body B',
    startedAt: '2026-06-12T16:10:00.000Z',
    completedAt: '2026-06-12T17:00:00.000Z',
    durationSeconds: 3000,
    exercises: [
      {
        id: 'history-ohp',
        name: 'Overhead Press',
        lastPerformance: '57.5kg x 6',
        personalBestKg: 60,
        sets: [{ id: 'history-ohp-1', weightKg: 60, reps: 6, completed: true }],
      },
      {
        id: 'history-pulldown',
        name: 'Lat Pulldown',
        lastPerformance: '70kg x 10',
        sets: [{ id: 'history-pulldown-1', weightKg: 72.5, reps: 10, completed: true }],
      },
    ],
  },
];
