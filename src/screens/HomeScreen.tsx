import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { AchievementCard } from '../components/home/AchievementCard';
import { LastWorkoutCard } from '../components/home/LastWorkoutCard';
import { WeeklyProgressCard } from '../components/home/WeeklyProgressCard';
import { Screen } from '../components/Screen';
import { calculateWeeklyConsistency } from '../lib/consistency';
import { findLatestPersonalBestAchievement } from '../lib/personalBest';
import { formatDashboardDate, getGreeting, getTrainingTarget, getUserFirstName } from '../lib/user';
import { useStartWorkout } from '../workouts/useStartWorkout';
import { useWorkouts } from '../workouts/WorkoutContext';

export function HomeScreen() {
  const { session } = useAuth();
  const { activeWorkout, startWorkout } = useStartWorkout();
  const { booting, completedWorkouts, trackedPbExerciseIds } = useWorkouts();
  const firstName = getUserFirstName(session?.user);
  const trainingTarget = getTrainingTarget(session?.user);
  const consistency = calculateWeeklyConsistency(completedWorkouts);
  const lastWorkout = completedWorkouts[0] ?? null;
  const latestPersonalBest = findLatestPersonalBestAchievement(
    completedWorkouts,
    trackedPbExerciseIds,
  );

  return (
    <Screen edges={['top', 'right', 'left']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-32">
          <AppHeader />

          <View className="pb-8 pt-8">
            <Text className="mb-2 text-xs font-extrabold tracking-widest text-secondary">{formatDashboardDate()}</Text>
            <Text className="text-[32px] font-extrabold leading-10 tracking-tight text-on-surface">
              {getGreeting()}, {firstName}
            </Text>
          </View>

          <View className="gap-4">
            <WeeklyProgressCard
              completed={consistency.completedDays}
              days={consistency.days}
              goal={trainingTarget}
            />
            {booting ? (
              <View className="items-center rounded-3xl border border-outline bg-white py-12 shadow-sm">
                <ActivityIndicator color="#0058bc" />
              </View>
            ) : (
              <LastWorkoutCard workout={lastWorkout} />
            )}
            <AchievementCard achievement={latestPersonalBest} />

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
