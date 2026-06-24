import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useWorkouts } from './WorkoutContext';

export function useStartWorkout() {
  const router = useRouter();
  const { activeWorkout, cancelWorkout, startNewWorkout, startWorkoutFromCompleted } = useWorkouts();

  async function openNewWorkout() {
    await startNewWorkout();
    router.push('/workout/active');
  }

  async function openWorkoutFromCompleted(workoutId: string) {
    const workout = await startWorkoutFromCompleted(workoutId);
    if (workout) router.push('/workout/active');
  }

  function startWorkout() {
    if (!activeWorkout) {
      void openNewWorkout();
      return;
    }

    Alert.alert(
      'Workout in progress',
      'Resume your current workout or discard it and start a new one.',
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Start new',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Discard current workout?',
              'All sets in the unfinished workout will be lost.',
              [
                { text: 'Keep workout', style: 'cancel' },
                {
                  text: 'Discard and start new',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      await cancelWorkout();
                      await openNewWorkout();
                    })();
                  },
                },
              ],
            );
          },
        },
        {
          text: 'Resume',
          onPress: () => router.push('/workout/active'),
        },
      ],
    );
  }

  function startFavoriteWorkout(workoutId: string) {
    if (!activeWorkout) {
      void openWorkoutFromCompleted(workoutId);
      return;
    }

    Alert.alert(
      'Workout in progress',
      'Discard your current workout and start this favorite instead?',
      [
        { text: 'Keep workout', style: 'cancel' },
        {
          text: 'Discard and start favorite',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await cancelWorkout();
              await openWorkoutFromCompleted(workoutId);
            })();
          },
        },
        {
          text: 'Resume current',
          onPress: () => router.push('/workout/active'),
        },
      ],
    );
  }

  return {
    activeWorkout,
    startFavoriteWorkout,
    startWorkout,
  };
}
