import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { formatWorkoutDate, getHeaviestCompletedSet } from '../../lib/workout';
import type { CompletedWorkout } from '../../types/workout';

export function LastWorkoutCard({ workout }: { workout: CompletedWorkout | null }) {
  if (!workout) {
    return (
      <View className="items-center rounded-3xl border border-outline bg-white px-6 py-8 shadow-sm">
        <Ionicons color="#00677f" name="barbell-outline" size={28} />
        <Text className="mt-3 text-lg font-extrabold text-on-surface">No workouts yet</Text>
        <Text className="mt-1 text-center text-sm leading-5 text-on-surface-variant">
          Finish your first workout to see it here.
        </Text>
      </View>
    );
  }

  const exercises = workout.exercises.slice(0, 3);

  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-6 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Last workout</Text>
          <Text className="text-xl font-bold text-on-surface">{workout.name}</Text>
        </View>
        <Text className="text-sm text-on-surface-variant">{formatWorkoutDate(workout.completedAt)}</Text>
      </View>

      {exercises.map((exercise, index) => {
        const bestSet = getHeaviestCompletedSet(exercise);

        return (
          <View
            className={'flex-row items-center justify-between py-3 ' + (index < exercises.length - 1 ? 'border-b border-surface-container' : '')}
            key={exercise.id}
          >
            <Text className="flex-1 pr-3 text-base text-on-surface">{exercise.name}</Text>
            <Text className="text-base font-bold text-primary">
              {bestSet ? bestSet.weightKg + ' kg x ' + bestSet.reps : 'No completed sets'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
