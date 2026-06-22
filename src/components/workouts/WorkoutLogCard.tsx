import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  countCompletedSets,
  formatWorkoutDate,
  formatWorkoutDuration,
  getHeaviestCompletedSet,
} from '../../lib/workout';
import type { CompletedWorkout } from '../../types/workout';
import type { WorkoutSyncStatus } from '../../types/workoutSync';

type Props = {
  workout: CompletedWorkout;
  syncStatus?: WorkoutSyncStatus;
  onRetrySync: () => void;
};

export function WorkoutLogCard({ workout, syncStatus, onRetrySync }: Props) {
  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-on-surface">{workout.name}</Text>
          <Text className="mt-1 text-sm text-on-surface-variant">
            {formatWorkoutDate(workout.completedAt)}
          </Text>
        </View>
        <View className="rounded-xl bg-surface-container px-3 py-2">
          <Text className="text-xs font-extrabold text-secondary">
            {formatWorkoutDuration(workout.durationSeconds)}
          </Text>
        </View>
      </View>

      <View className="mb-4 flex-row gap-4">
        <View className="flex-row items-center gap-1.5">
          <Ionicons color="#414755" name="barbell-outline" size={17} />
          <Text className="text-sm text-on-surface-variant">
            {workout.exercises.length} exercises
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons color="#414755" name="checkmark-circle-outline" size={17} />
          <Text className="text-sm text-on-surface-variant">
            {countCompletedSets(workout.exercises)} sets
          </Text>
        </View>
      </View>

      {syncStatus && syncStatus !== 'synced' ? (
        <SyncStatus status={syncStatus} onRetry={onRetrySync} />
      ) : null}

      {workout.exercises.slice(0, 3).map((exercise, index) => {
        const bestSet = getHeaviestCompletedSet(exercise);

        return (
          <View
            className={'flex-row items-center justify-between py-2.5 ' + (index < Math.min(workout.exercises.length, 3) - 1 ? 'border-b border-surface-container' : '')}
            key={exercise.id}
          >
            <Text className="flex-1 text-[15px] text-on-surface">{exercise.name}</Text>
            <Text className="font-bold text-primary">
              {bestSet ? bestSet.weightKg + 'kg x ' + bestSet.reps : 'No completed sets'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function SyncStatus({ status, onRetry }: { status: WorkoutSyncStatus; onRetry: () => void }) {
  if (status === 'syncing') {
    return (
      <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
        <ActivityIndicator color="#00677f" size="small" />
        <Text className="text-xs font-bold text-secondary">Syncing workout...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View className="mb-4 flex-row items-center rounded-xl bg-[#fff1f0] px-3 py-2">
        <Ionicons color="#ba1a1a" name="cloud-offline-outline" size={17} />
        <Text className="ml-2 flex-1 text-xs font-bold text-[#8c1d18]">Sync failed</Text>
        <Pressable className="rounded-lg px-2 py-1 active:opacity-60" onPress={onRetry}>
          <Text className="text-xs font-extrabold text-primary">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
      <Ionicons color="#00677f" name="cloud-upload-outline" size={17} />
      <Text className="text-xs font-bold text-secondary">Waiting to sync</Text>
    </View>
  );
}
