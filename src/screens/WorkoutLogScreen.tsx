import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { WorkoutLogCard } from '../components/workouts/WorkoutLogCard';
import { useStartWorkout } from '../workouts/useStartWorkout';
import { useWorkouts } from '../workouts/WorkoutContext';

export function WorkoutLogScreen() {
  const { activeWorkout, startWorkout } = useStartWorkout();
  const { booting, completedWorkouts } = useWorkouts();

  return (
    <Screen edges={['top', 'right', 'left']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10">
          <AppHeader />

          <View className="pb-7 pt-8">
            <Text className="text-[32px] font-extrabold tracking-tight text-on-surface">Workout Log</Text>
            <Text className="mt-2 text-base leading-6 text-on-surface-variant">
              Review previous sessions and continue building momentum.
            </Text>
          </View>

          {activeWorkout ? (
            <View className="mb-4 flex-row items-center rounded-3xl border border-accent bg-[#d9f8ff] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-accent">
                <Ionicons color="#005266" name="timer-outline" size={23} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-extrabold uppercase tracking-widest text-secondary">Workout in progress</Text>
                <Text className="mt-1 text-sm text-on-surface-variant">Resume it or choose to start over.</Text>
              </View>
            </View>
          ) : null}

          <Pressable
            className="mb-7 h-16 flex-row items-center justify-center gap-3 rounded-3xl bg-primary shadow-sm active:scale-[0.99] active:opacity-80"
            onPress={startWorkout}
          >
            <Text className="text-lg font-extrabold text-on-primary">
              {activeWorkout ? 'Resume or Start New' : 'Start Workout'}
            </Text>
            <Ionicons color="#ffffff" name={activeWorkout ? 'refresh' : 'play'} size={22} />
          </Pressable>

          <Text className="mb-3 px-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Previous workouts</Text>

          {booting ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#0058bc" />
            </View>
          ) : (
            <View className="gap-4">
              {completedWorkouts.map((workout) => (
                <WorkoutLogCard key={workout.id} workout={workout} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
