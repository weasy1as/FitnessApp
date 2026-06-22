import { Text, View } from 'react-native';

import type { WeeklyConsistencyDay } from '../../types/consistency';

type Props = {
  completed: number;
  days: WeeklyConsistencyDay[];
  goal: number;
};

export function WeeklyProgressCard({ completed, days, goal }: Props) {
  const remaining = Math.max(goal - completed, 0);

  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Weekly consistency</Text>
          <Text className="text-base text-on-surface-variant">
            {remaining === 0 ? 'Weekly goal complete' : remaining + ' more session' + (remaining === 1 ? '' : 's') + ' to your goal'}
          </Text>
        </View>
        <View className="rounded-xl bg-surface-container px-3 py-2">
          <Text className="text-base font-extrabold text-primary">{completed} / {goal}</Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {days.map((day) => (
          <View className="items-center gap-2" key={day.dateKey}>
            <View
              accessibilityLabel={`${day.label}: ${day.hasWorkout ? 'workout completed' : 'no workout'}`}
              className={
                'h-8 w-8 items-center justify-center rounded-full ' +
                (day.hasWorkout ? 'bg-accent' : 'bg-surface-container')
              }
            >
              <View className={'h-2 w-2 rounded-full ' + (day.hasWorkout ? 'bg-on-accent' : 'bg-outline')} />
            </View>
            <Text className={'text-xs font-bold ' + (day.isToday ? 'text-primary' : 'text-on-surface-variant')}>
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
