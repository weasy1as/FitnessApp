import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { formatWorkoutDate } from '../../lib/workout';
import type { PersonalBestAchievement } from '../../types/personalBest';

export function AchievementCard({ achievement }: { achievement: PersonalBestAchievement | null }) {
  if (!achievement) {
    return (
      <View className="flex-row items-center rounded-3xl border border-outline bg-surface-container-low p-4 shadow-sm">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-surface-container">
          <Ionicons color="#6f7583" name="medal-outline" size={25} />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Personal best</Text>
          <Text className="text-sm leading-5 text-on-surface-variant">
            Enable PB tracking during a workout, then beat your previous best.
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View className="flex-row items-center rounded-3xl border border-outline bg-surface-container-low p-4 shadow-sm">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-primary">
        <Ionicons color="#ffffff" name="medal-outline" size={25} />
      </View>

      <View className="flex-1">
        <Text className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Recent achievement</Text>
        <Text className="text-base leading-6 text-on-surface">
          {achievement.exerciseName}{' '}
          <Text className="font-extrabold text-primary">+{achievement.improvementKg} kg</Text>
          {' '}on {formatWorkoutDate(achievement.completedAt)}
        </Text>
      </View>

      <View className="ml-3 rounded-xl bg-[#f6e05e]/30 px-3 py-2">
        <Text className="text-xs font-extrabold text-[#744210]">PB</Text>
      </View>
    </View>
  );
}
