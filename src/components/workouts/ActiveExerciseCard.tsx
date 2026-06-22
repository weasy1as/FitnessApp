import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

import { getLivePersonalBestSetId } from '../../lib/personalBest';
import type { WorkoutExercise } from '../../types/workout';
import { ActiveSetRow } from './ActiveSetRow';

type Props = {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onRemove: () => void;
  onTogglePbTracking: () => void;
  pbTrackingEnabled: boolean;
  pbTrackingError?: string;
  pbTrackingPending: boolean;
  personalBestKg?: number;
  onUpdateSet: (
    setId: string,
    values: { weightKg?: number; reps?: number; completed?: boolean },
  ) => void;
};

export function ActiveExerciseCard({
  exercise,
  onAddSet,
  onRemove,
  onTogglePbTracking,
  onUpdateSet,
  pbTrackingEnabled,
  pbTrackingError,
  pbTrackingPending,
  personalBestKg,
}: Props) {
  const livePersonalBestSetId = pbTrackingEnabled
    ? getLivePersonalBestSetId(exercise, personalBestKg)
    : undefined;
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
          {pbTrackingEnabled && personalBestKg !== undefined ? (
            <Text className="mt-2 text-sm text-on-surface-variant">
              Personal best: <Text className="font-bold text-on-surface">{personalBestKg} kg</Text>
            </Text>
          ) : null}
        </View>

        <View className="items-end gap-2">
          <Pressable accessibilityLabel={`Remove ${exercise.name}`} className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:opacity-60" onPress={onRemove}>
            <Ionicons color="#6f7583" name="trash-outline" size={19} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-extrabold uppercase tracking-wide text-secondary">PB</Text>
            {pbTrackingPending ? (
              <View className="h-8 w-12 items-center justify-center">
                <ActivityIndicator color="#00677f" size="small" />
              </View>
            ) : (
              <Switch
                accessibilityLabel={`Track personal bests for ${exercise.name}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: pbTrackingEnabled }}
                disabled={!exercise.catalogExerciseId}
                onValueChange={onTogglePbTracking}
                thumbColor="#ffffff"
                trackColor={{ false: '#c4c6cf', true: '#2f80ed' }}
                value={pbTrackingEnabled}
              />
            )}
          </View>
        </View>
      </View>

      {pbTrackingError ? (
        <Text className="mb-4 text-sm leading-5 text-[#ba1a1a]">{pbTrackingError}</Text>
      ) : null}

      {livePersonalBestSetId ? (
        <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-[#fff8dc] px-3 py-2">
          <Ionicons color="#744210" name="medal-outline" size={17} />
          <Text className="text-xs font-extrabold uppercase tracking-wide text-[#744210]">New personal best</Text>
        </View>
      ) : null}

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
            isPersonalBest={set.id === livePersonalBestSetId}
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
