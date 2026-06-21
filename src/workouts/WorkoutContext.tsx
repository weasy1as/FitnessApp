import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { dummyWorkoutHistory } from '../data/workoutHistory';
import { countCompletedSets, createExercise, createSet, createWorkoutDraft } from '../lib/workout';
import type { ActiveWorkout, CompletedWorkout } from '../types/workout';
import {
  clearActiveWorkout,
  loadActiveWorkout,
  loadCompletedWorkouts,
  saveActiveWorkout,
  saveCompletedWorkouts,
} from './workoutStorage';

type WorkoutContextValue = {
  activeWorkout: ActiveWorkout | null;
  completedWorkouts: CompletedWorkout[];
  booting: boolean;
  startNewWorkout: () => Promise<ActiveWorkout>;
  cancelWorkout: () => Promise<void>;
  finishWorkout: () => Promise<CompletedWorkout | null>;
  addExercise: () => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, values: { weightKg?: number; reps?: number; completed?: boolean }) => void;
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

export function WorkoutProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [storedWorkouts, setStoredWorkouts] = useState<CompletedWorkout[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!userId) {
        setActiveWorkout(null);
        setStoredWorkouts([]);
        setLoadedUserId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [active, history] = await Promise.all([
          loadActiveWorkout(userId),
          loadCompletedWorkouts(userId),
        ]);
        if (mounted) {
          setActiveWorkout(active);
          setStoredWorkouts(history);
        }
      } catch (error) {
        console.warn('Unable to restore workout data.', error);
        if (mounted) {
          setActiveWorkout(null);
          setStoredWorkouts([]);
        }
      } finally {
        if (mounted) {
          setLoadedUserId(userId);
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const completedWorkouts = useMemo(
    () =>
      [...storedWorkouts, ...dummyWorkoutHistory].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      ),
    [storedWorkouts],
  );

  const booting = Boolean(userId) && (loading || loadedUserId !== userId);

  async function startNewWorkout() {
    if (!userId) throw new Error('You must be signed in to start a workout.');
    const workout = createWorkoutDraft();
    setActiveWorkout(workout);
    await saveActiveWorkout(userId, workout);
    return workout;
  }

  async function cancelWorkout() {
    if (!userId) return;
    setActiveWorkout(null);
    await clearActiveWorkout(userId);
  }

  async function finishWorkout() {
    if (!userId || !activeWorkout || countCompletedSets(activeWorkout.exercises) === 0) {
      return null;
    }

    const completedAt = new Date().toISOString();
    const completed: CompletedWorkout = {
      ...activeWorkout,
      status: 'completed',
      completedAt,
      durationSeconds: Math.max(
        1,
        Math.round((new Date(completedAt).getTime() - new Date(activeWorkout.startedAt).getTime()) / 1000),
      ),
    };

    const nextHistory = [completed, ...storedWorkouts];
    setStoredWorkouts(nextHistory);
    setActiveWorkout(null);
    await Promise.all([
      saveCompletedWorkouts(userId, nextHistory),
      clearActiveWorkout(userId),
    ]);
    return completed;
  }

  function updateActive(updater: (current: ActiveWorkout) => ActiveWorkout) {
    setActiveWorkout((current) => {
      if (!current || !userId) return current;
      const next = updater(current);
      void saveActiveWorkout(userId, next);
      return next;
    });
  }

  function addExercise() {
    updateActive((current) => ({
      ...current,
      exercises: [...current.exercises, createExercise(current.exercises.length)],
    }));
  }

  function addSet(exerciseId: string) {
    updateActive((current) => {
      const exercise = current.exercises.find((item) => item.id === exerciseId);
      const previousSet = exercise?.sets[exercise.sets.length - 1];

      return {
        ...current,
        exercises: current.exercises.map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                sets: [...item.sets, createSet(previousSet?.weightKg ?? 0, previousSet?.reps ?? 0)],
              }
            : item,
        ),
      };
    });
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    values: { weightKg?: number; reps?: number; completed?: boolean },
  ) {
    updateActive((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...values } : set)),
            }
          : exercise,
      ),
    }));
  }

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        completedWorkouts,
        booting,
        startNewWorkout,
        cancelWorkout,
        finishWorkout,
        addExercise,
        addSet,
        updateSet,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkouts must be used inside WorkoutProvider.');
  return context;
}
