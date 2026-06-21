import { Text, View } from 'react-native';

import type { LastWorkoutSummary } from '../../types/home';

export function LastWorkoutCard({ workout }: { workout: LastWorkoutSummary }) {
  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-6 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Last workout</Text>
          <Text className="text-xl font-bold text-on-surface">{workout.name}</Text>
        </View>
        <Text className="text-sm text-on-surface-variant">{workout.dateLabel}</Text>
      </View>

      {workout.exercises.map((exercise, index) => (
        <View
          className={'flex-row items-center justify-between py-3 ' + (index < workout.exercises.length - 1 ? 'border-b border-surface-container' : '')}
          key={exercise.id}
        >
          <Text className="text-base text-on-surface">{exercise.name}</Text>
          <Text className="text-base font-bold text-primary">
            {exercise.weightKg} <Text className="text-sm font-normal text-on-surface-variant">kg</Text> x {exercise.reps}
          </Text>
        </View>
      ))}
    </View>
  );
}
