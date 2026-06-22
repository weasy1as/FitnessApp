import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import type { WorkoutExercise } from '../../types/workout';
import { ActiveSetRow } from './ActiveSetRow';

type Props = {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onRemove: () => void;
  onUpdateSet: (
    setId: string,
    values: { weightKg?: number; reps?: number; completed?: boolean },
  ) => void;
};

export function ActiveExerciseCard({ exercise, onAddSet, onRemove, onUpdateSet }: Props) {
  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-extrabold leading-7 text-on-surface">{exercise.name}</Text>
          {exercise.primaryMuscle || exercise.equipment ? (
            <Text className="mt-1 text-sm capitalize text-on-surface-variant">
              {[exercise.primaryMuscle, exercise.equipment].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          {exercise.lastPerformance ? (
            <Text className="mt-2 text-sm text-on-surface-variant">
              Last: <Text className="font-bold text-on-surface">{exercise.lastPerformance}</Text>
            </Text>
          ) : null}
        </View>

        <View className="items-end gap-2">
          <Pressable accessibilityLabel={`Remove ${exercise.name}`} className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:opacity-60" onPress={onRemove}>
            <Ionicons color="#6f7583" name="trash-outline" size={19} />
          </Pressable>
          {exercise.personalBestKg ? (
            <View className="flex-row items-center gap-1.5 rounded-2xl bg-[#e0f7fa] px-3 py-2">
              <Ionicons color="#006064" name="medal-outline" size={17} />
              <Text className="text-xs font-extrabold text-[#006064]">PB: {exercise.personalBestKg}kg</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mb-2 flex-row px-3">
        <Text className="w-8 text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Set</Text>
        <Text className="mr-3 flex-1 text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Weight</Text>
        <Text className="mr-3 flex-1 text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Reps</Text>
        <Text className="w-11 text-center text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Done</Text>
      </View>

      <View className="gap-3">
        {exercise.sets.map((set, index) => (
          <ActiveSetRow
            index={index}
            key={set.id}
            onChange={(values) => onUpdateSet(set.id, values)}
            set={set}
          />
        ))}
      </View>

      <Pressable
        className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-accent bg-[#d9f8ff] active:opacity-70"
        onPress={onAddSet}
      >
        <Ionicons color="#00677f" name="add" size={20} />
        <Text className="text-sm font-extrabold uppercase tracking-wide text-secondary">Add set</Text>
      </Pressable>
    </View>
  );
}
