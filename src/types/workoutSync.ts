import type { CompletedWorkout } from './workout';

export type WorkoutSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type StoredWorkoutRecord = {
  workout: CompletedWorkout;
  syncStatus: WorkoutSyncStatus;
  serverId?: string;
  syncError?: string;
};
