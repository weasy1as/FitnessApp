import { Text, View } from 'react-native';

type Props = {
  completed: number;
  goal: number;
};

export function WeeklyProgressCard({ completed, goal }: Props) {
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

      <View className="flex-row gap-2">
        {Array.from({ length: goal }, (_, index) => (
          <View
            className={'h-2.5 flex-1 rounded-full ' + (index < completed ? 'bg-accent' : 'bg-surface-container')}
            key={index}
          />
        ))}
      </View>
    </View>
  );
}
