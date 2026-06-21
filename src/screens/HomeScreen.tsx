import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { AchievementCard } from '../components/home/AchievementCard';
import { LastWorkoutCard } from '../components/home/LastWorkoutCard';
import { WeeklyProgressCard } from '../components/home/WeeklyProgressCard';
import { Screen } from '../components/Screen';
import { homeDashboardData } from '../data/homeDashboard';
import { formatDashboardDate, getGreeting, getUserFirstName } from '../lib/user';
import { useStartWorkout } from '../workouts/useStartWorkout';

export function HomeScreen() {
  const { session } = useAuth();
  const { activeWorkout, startWorkout } = useStartWorkout();
  const firstName = getUserFirstName(session?.user);

  return (
    <Screen edges={['top', 'right', 'left']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10">
          <AppHeader />

          <View className="pb-8 pt-8">
            <Text className="mb-2 text-xs font-extrabold tracking-widest text-secondary">{formatDashboardDate()}</Text>
            <Text className="text-[32px] font-extrabold leading-10 tracking-tight text-on-surface">
              {getGreeting()}, {firstName}
            </Text>
          </View>

          <View className="gap-4">
            <WeeklyProgressCard completed={homeDashboardData.completedSessions} goal={homeDashboardData.weeklyGoal} />
            <LastWorkoutCard workout={homeDashboardData.lastWorkout} />
            <AchievementCard achievement={homeDashboardData.achievement} />

            <Pressable
              className="mt-1 h-16 flex-row items-center justify-center gap-3 rounded-3xl bg-primary shadow-sm active:scale-[0.99] active:opacity-80"
              onPress={startWorkout}
            >
              <Text className="text-lg font-extrabold text-on-primary">
                {activeWorkout ? 'Resume Workout' : 'Start Workout'}
              </Text>
              <Ionicons color="#ffffff" name={activeWorkout ? 'refresh' : 'play'} size={22} />
            </Pressable>
          </View>

          <Text className="pb-2 pt-10 text-center text-sm italic text-on-surface-variant">
            Stay focused. The data is the work.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
