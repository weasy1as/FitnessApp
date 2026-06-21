import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import type { AchievementSummary } from '../../types/home';

export function AchievementCard({ achievement }: { achievement: AchievementSummary }) {
  return (
    <View className="flex-row items-center rounded-3xl border border-outline bg-surface-container-low p-4 shadow-sm">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-primary">
        <Ionicons color="#ffffff" name="medal-outline" size={25} />
      </View>

      <View className="flex-1">
        <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Recent achievement</Text>
        <Text className="text-base leading-6 text-on-surface">
          {achievement.exerciseName}{' '}
          <Text className="font-extrabold text-primary">+{achievement.improvementKg}kg</Text>
          {' '}last session
        </Text>
      </View>

      <View className="ml-3 rounded-xl bg-[#f6e05e]/30 px-3 py-2">
        <Text className="text-xs font-extrabold text-[#744210]">{achievement.label}</Text>
      </View>
    </View>
  );
}
