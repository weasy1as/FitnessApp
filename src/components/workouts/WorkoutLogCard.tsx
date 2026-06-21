import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { countCompletedSets, formatWorkoutDate, formatWorkoutDuration } from '../../lib/workout';
import type { CompletedWorkout } from '../../types/workout';

export function WorkoutLogCard({ workout }: { workout: CompletedWorkout }) {
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

      {workout.exercises.slice(0, 3).map((exercise, index) => {
        const bestSet = exercise.sets
          .filter((set) => set.completed)
          .sort((a, b) => b.weightKg - a.weightKg)[0];

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
