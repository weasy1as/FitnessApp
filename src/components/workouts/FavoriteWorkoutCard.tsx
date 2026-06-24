import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  countCompletedSets,
  formatWorkoutDate,
  formatWorkoutDuration,
} from '../../lib/workout';
import type { CompletedWorkout } from '../../types/workout';

type Props = {
  favoritePending: boolean;
  onStart: () => void;
  onToggleFavorite: () => void;
  workout: CompletedWorkout;
};

export function FavoriteWorkoutCard({
  favoritePending,
  onStart,
  onToggleFavorite,
  workout,
}: Props) {
  return (
    <View className="rounded-3xl border border-[#ffd980] bg-[#fff9e8] p-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons color="#b26a00" name="star" size={17} />
            <Text className="text-xs font-extrabold uppercase tracking-widest text-[#855100]">
              Favorite
            </Text>
          </View>
          <Text className="text-lg font-extrabold text-on-surface">{workout.name}</Text>
          <Text className="mt-1 text-sm text-on-surface-variant">
            {formatWorkoutDate(workout.completedAt)}
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Remove favorite workout"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-2xl bg-white active:opacity-70"
          disabled={favoritePending}
          onPress={onToggleFavorite}
        >
          {favoritePending ? (
            <ActivityIndicator color="#00677f" size="small" />
          ) : (
            <Ionicons color="#b26a00" name="star" size={21} />
          )}
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Ionicons color="#414755" name="barbell-outline" size={16} />
          <Text className="text-sm font-bold text-on-surface-variant">
            {workout.exercises.length} exercises
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons color="#414755" name="checkmark-circle-outline" size={16} />
          <Text className="text-sm font-bold text-on-surface-variant">
            {countCompletedSets(workout.exercises)} sets
          </Text>
        </View>
        <Text className="text-sm font-bold text-on-surface-variant">
          {formatWorkoutDuration(workout.durationSeconds)}
        </Text>
      </View>

      <Pressable
        className="mt-4 h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-80"
        onPress={onStart}
      >
        <Text className="font-extrabold text-on-primary">Start this workout</Text>
        <Ionicons color="#ffffff" name="play" size={18} />
      </Pressable>
    </View>
  );
}
