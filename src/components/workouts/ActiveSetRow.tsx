import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { WorkoutSet } from '../../types/workout';

type Props = {
  index: number;
  isPersonalBest?: boolean;
  set: WorkoutSet;
  onChange: (values: { weightKg?: number; reps?: number; completed?: boolean }) => void;
};

function parseNumber(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function ActiveSetRow({ index, isPersonalBest = false, set, onChange }: Props) {
  return (
    <View
      className={
        'flex-row items-center rounded-2xl border px-3 py-3 ' +
        (isPersonalBest
          ? 'border-[#d4a72c] bg-[#fff8dc]'
          : set.completed
            ? 'border-transparent bg-surface-container-low'
            : 'border-primary bg-white')
      }
    >
      <View className="w-8 items-start">
        <Text className={'text-base font-extrabold ' + (set.completed ? 'text-on-surface-variant' : 'text-primary')}>
          {index + 1}
        </Text>
        {isPersonalBest ? <Text className="text-[9px] font-extrabold text-[#744210]">PB</Text> : null}
      </View>

      <TextInput
        className="mr-3 h-11 flex-1 border-b border-outline px-2 text-base text-on-surface"
        keyboardType="decimal-pad"
        onChangeText={(value) => onChange({ weightKg: parseNumber(value) })}
        selectTextOnFocus
        value={set.weightKg ? String(set.weightKg) : ''}
      />

      <TextInput
        className="mr-3 h-11 flex-1 border-b border-outline px-2 text-base text-on-surface"
        keyboardType="number-pad"
        onChangeText={(value) => onChange({ reps: Math.round(parseNumber(value)) })}
        selectTextOnFocus
        value={set.reps ? String(set.reps) : ''}
      />

      <Pressable
        accessibilityLabel={set.completed ? 'Mark set incomplete' : 'Complete set'}
        className={
          'h-11 w-11 items-center justify-center rounded-full active:opacity-70 ' +
          (set.completed ? 'bg-surface-container' : 'bg-primary')
        }
        onPress={() => onChange({ completed: !set.completed })}
      >
        <Ionicons color={set.completed ? '#0058bc' : '#ffffff'} name={set.completed ? 'checkmark-circle' : 'checkmark'} size={25} />
      </Pressable>
    </View>
  );
}
