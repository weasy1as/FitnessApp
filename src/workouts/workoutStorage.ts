import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveWorkout, CompletedWorkout } from '../types/workout';
import type { StoredWorkoutRecord } from '../types/workoutSync';

function activeKey(userId: string) {
  return 'gymflow:' + userId + ':active-workout';
}

function historyKey(userId: string) {
  return 'gymflow:' + userId + ':completed-workouts';
}

function versionedHistoryKey(userId: string) {
  return historyKey(userId) + ':v2';
}

export async function loadActiveWorkout(userId: string): Promise<ActiveWorkout | null> {
  const value = await AsyncStorage.getItem(activeKey(userId));
  return value ? (JSON.parse(value) as ActiveWorkout) : null;
}

export async function saveActiveWorkout(userId: string, workout: ActiveWorkout): Promise<void> {
  await AsyncStorage.setItem(activeKey(userId), JSON.stringify(workout));
}

export async function clearActiveWorkout(userId: string): Promise<void> {
  await AsyncStorage.removeItem(activeKey(userId));
}

export async function loadWorkoutRecords(userId: string): Promise<StoredWorkoutRecord[]> {
  const versionedValue = await AsyncStorage.getItem(versionedHistoryKey(userId));
  if (versionedValue) {
    return normalizeRecords(JSON.parse(versionedValue) as StoredWorkoutRecord[]);
  }

  const legacyValue = await AsyncStorage.getItem(historyKey(userId));
  const legacyWorkouts = legacyValue ? (JSON.parse(legacyValue) as CompletedWorkout[]) : [];
  const migratedRecords = legacyWorkouts.map<StoredWorkoutRecord>((workout) => ({
    workout,
    syncStatus: 'pending',
  }));
  await saveWorkoutRecords(userId, migratedRecords);
  return migratedRecords;
}

export async function saveWorkoutRecords(
  userId: string,
  records: StoredWorkoutRecord[],
): Promise<void> {
  await AsyncStorage.setItem(versionedHistoryKey(userId), JSON.stringify(records));
}

function normalizeRecords(records: StoredWorkoutRecord[]): StoredWorkoutRecord[] {
  return records.map((record) =>
    record.syncStatus === 'syncing' ? { ...record, syncStatus: 'pending' } : record,
  );
}
