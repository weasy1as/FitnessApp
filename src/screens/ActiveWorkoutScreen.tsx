import Ionicons from '@expo/vector-icons/Ionicons';
import { usePreventRemove } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { ActiveExerciseCard } from '../components/workouts/ActiveExerciseCard';
import { Screen } from '../components/Screen';
import { countCompletedSets, formatElapsedTime } from '../lib/workout';
import { useElapsedTime } from '../workouts/useElapsedTime';
import { useWorkouts } from '../workouts/WorkoutContext';

export function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    booting,
    addExercise,
    addSet,
    cancelWorkout,
    finishWorkout,
    updateSet,
  } = useWorkouts();
  const elapsed = useElapsedTime(activeWorkout?.startedAt);

  useEffect(() => {
    if (!booting && !activeWorkout) {
      router.replace('/workout');
    }
  }, [activeWorkout, booting, router]);

  function confirmCancel() {
    Alert.alert(
      'Cancel workout?',
      'All sets logged in this workout will be discarded.',
      [
        { text: 'Keep workout', style: 'cancel' },
        {
          text: 'Discard workout',
          style: 'destructive',
          onPress: () => {
            void cancelWorkout();
          },
        },
      ],
    );
  }

  usePreventRemove(Boolean(activeWorkout), () => {
    confirmCancel();
  });

  async function handleFinish() {
    if (!activeWorkout || countCompletedSets(activeWorkout.exercises) === 0) {
      Alert.alert('Complete a set first', 'Mark at least one set as complete before finishing.');
      return;
    }
    await finishWorkout();
  }

  if (booting || !activeWorkout) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="h-16 flex-row items-center border-b border-outline px-5">
        <Pressable className="w-20 active:opacity-60" onPress={confirmCancel}>
          <Text className="font-bold text-on-surface-variant">Cancel</Text>
        </Pressable>
        <View className="flex-1 flex-row items-center justify-center gap-2">
          <Ionicons color="#0058bc" name="timer-outline" size={21} />
          <Text className="text-base font-extrabold text-on-surface">Workout Session</Text>
        </View>
        <Pressable className="w-20 items-end active:opacity-70" onPress={() => void handleFinish()}>
          <Text className="font-extrabold uppercase text-secondary">Finish</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10">
          <View className="flex-row items-end gap-3 py-8">
            <Text className="text-[42px] font-extrabold tracking-tight text-primary">
              {formatElapsedTime(elapsed)}
            </Text>
            <Text className="pb-2 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
              Elapsed
            </Text>
          </View>

          <View className="gap-5">
            {activeWorkout.exercises.map((exercise) => (
              <ActiveExerciseCard
                exercise={exercise}
                key={exercise.id}
                onAddSet={() => addSet(exercise.id)}
                onUpdateSet={(setId, values) => updateSet(exercise.id, setId, values)}
              />
            ))}

            <Pressable
              className="h-28 items-center justify-center rounded-3xl border-2 border-dashed border-outline bg-surface-container-low active:opacity-70"
              onPress={addExercise}
            >
              <Ionicons color="#00677f" name="add-circle-outline" size={27} />
              <Text className="mt-2 text-sm font-extrabold uppercase tracking-wide text-secondary">Add exercise</Text>
            </Pressable>
          </View>

          <Text className="pb-3 pt-10 text-center text-sm italic text-on-surface-variant">
            Stay focused. Breathe.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
