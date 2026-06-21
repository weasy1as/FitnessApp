import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ActiveWorkout, CompletedWorkout } from '../types/workout';

function activeKey(userId: string) {
  return 'gymflow:' + userId + ':active-workout';
}

function historyKey(userId: string) {
  return 'gymflow:' + userId + ':completed-workouts';
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

export async function loadCompletedWorkouts(userId: string): Promise<CompletedWorkout[]> {
  const value = await AsyncStorage.getItem(historyKey(userId));
  return value ? (JSON.parse(value) as CompletedWorkout[]) : [];
}

export async function saveCompletedWorkouts(userId: string, workouts: CompletedWorkout[]): Promise<void> {
  await AsyncStorage.setItem(historyKey(userId), JSON.stringify(workouts));
}
