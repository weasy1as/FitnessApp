import Ionicons from '@expo/vector-icons/Ionicons';
import { usePreventRemove } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { ActiveExerciseCard } from '../components/workouts/ActiveExerciseCard';
import { Screen } from '../components/Screen';
import { countCompletedSets, formatElapsedTime } from '../lib/workout';
import { calculatePersonalBests } from '../lib/personalBest';
import { calculateExerciseProgressions } from '../lib/progressiveOverload';
import { useElapsedTime } from '../workouts/useElapsedTime';
import { useWorkouts } from '../workouts/WorkoutContext';

export function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    completedWorkouts,
    booting,
    addSet,
    cancelWorkout,
    finishWorkout,
    pbTrackingErrors,
    pbTrackingPendingIds,
    removeExercise,
    togglePbTracking,
    trackedPbExerciseIds,
    updateSet,
  } = useWorkouts();
  const elapsed = useElapsedTime(activeWorkout?.startedAt);
  const [finishing, setFinishing] = useState(false);
  const personalBests = useMemo(
    () => calculatePersonalBests(completedWorkouts, trackedPbExerciseIds),
    [completedWorkouts, trackedPbExerciseIds],
  );
  const exerciseProgressions = useMemo(
    () => calculateExerciseProgressions(completedWorkouts),
    [completedWorkouts],
  );

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
    setFinishing(true);
    try {
      await finishWorkout();
    } catch (error) {
      console.warn('Unable to finish workout.', error);
      Alert.alert(
        'Workout not saved',
        'Your active workout is still safe on this device. Please try finishing again.',
      );
    } finally {
      setFinishing(false);
    }
  }

  function confirmRemoveExercise(exerciseId: string, exerciseName: string) {
    Alert.alert('Remove exercise?', `${exerciseName} and all of its sets will be removed from this workout.`, [
      { text: 'Keep exercise', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeExercise(exerciseId) },
    ]);
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
        <Pressable
          className="w-20 items-end active:opacity-70 disabled:opacity-50"
          disabled={finishing}
          onPress={() => void handleFinish()}
        >
          {finishing ? (
            <ActivityIndicator color="#00677f" size="small" />
          ) : (
            <Text className="font-extrabold uppercase text-secondary">Finish</Text>
          )}
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
            {activeWorkout.exercises.map((exercise) => {
              const catalogExerciseId = exercise.catalogExerciseId;
              const trackingEnabled = Boolean(
                catalogExerciseId && trackedPbExerciseIds.has(catalogExerciseId),
              );
              const progression = catalogExerciseId
                ? exerciseProgressions.get(catalogExerciseId)
                : undefined;
              const nextIncompleteSet = exercise.sets.find((set) => !set.completed);

              return (
                <ActiveExerciseCard
                  exercise={exercise}
                  key={exercise.id}
                  onAddSet={() => addSet(exercise.id)}
                  onApplyProgression={() => {
                    if (nextIncompleteSet && progression?.suggestion) {
                      updateSet(exercise.id, nextIncompleteSet.id, {
                        weightKg: progression.suggestion.suggestedWeightKg,
                      });
                    }
                  }}
                  onRemove={() => confirmRemoveExercise(exercise.id, exercise.name)}
                  onTogglePbTracking={() => {
                    if (catalogExerciseId) void togglePbTracking(catalogExerciseId);
                  }}
                  onUpdateSet={(setId, values) => updateSet(exercise.id, setId, values)}
                  pbTrackingEnabled={trackingEnabled}
                  pbTrackingError={catalogExerciseId ? pbTrackingErrors[catalogExerciseId] : undefined}
                  pbTrackingPending={Boolean(catalogExerciseId && pbTrackingPendingIds.has(catalogExerciseId))}
                  personalBestKg={catalogExerciseId ? personalBests.get(catalogExerciseId)?.weightKg : undefined}
                  progression={progression}
                  progressionCanApply={Boolean(nextIncompleteSet && progression?.suggestion)}
                />
              );
            })}

            {!activeWorkout.exercises.length ? (
              <View className="items-center rounded-3xl border border-outline bg-white px-6 py-10">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#d9f8ff]">
                  <Ionicons color="#00677f" name="barbell-outline" size={28} />
                </View>
                <Text className="mt-4 text-xl font-extrabold text-on-surface">Build your workout</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-on-surface-variant">
                  Choose one or more exercises from the catalog to get started.
                </Text>
              </View>
            ) : null}

            <Pressable
              className="h-28 items-center justify-center rounded-3xl border-2 border-dashed border-outline bg-surface-container-low active:opacity-70"
              onPress={() => router.push('/workout/exercises' as Href)}
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
