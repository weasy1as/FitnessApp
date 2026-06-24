import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { useFavoriteWorkouts } from '../favoriteWorkouts/useFavoriteWorkouts';
import {
  countCompletedSets,
  createExercise,
  createSet,
  createWorkoutDraft,
  createWorkoutDraftFromCompleted,
  filterCompletedExercises,
} from '../lib/workout';
import type { ExerciseCatalogItem } from '../types/exercise';
import type { ActiveWorkout, CompletedWorkout } from '../types/workout';
import type { WorkoutSyncStatus } from '../types/workoutSync';
import { usePbTracking } from '../personalBest/usePbTracking';
import {
  clearActiveWorkout,
  loadActiveWorkout,
  saveActiveWorkout,
} from './workoutStorage';
import { useWorkoutHistory } from './useWorkoutHistory';

type WorkoutContextValue = {
  activeWorkout: ActiveWorkout | null;
  completedWorkouts: CompletedWorkout[];
  workoutSyncStatus: Record<string, WorkoutSyncStatus>;
  booting: boolean;
  historyRefreshing: boolean;
  historyError: string | null;
  favoriteWorkoutIds: ReadonlySet<string>;
  favoriteWorkoutErrors: Record<string, string>;
  favoriteWorkoutPendingIds: ReadonlySet<string>;
  trackedPbExerciseIds: ReadonlySet<string>;
  pbTrackingErrors: Record<string, string>;
  pbTrackingPendingIds: ReadonlySet<string>;
  toggleFavoriteWorkout: (workoutId: string) => Promise<void>;
  togglePbTracking: (exerciseId: string) => Promise<void>;
  startNewWorkout: () => Promise<ActiveWorkout>;
  startWorkoutFromCompleted: (workoutId: string) => Promise<ActiveWorkout | null>;
  cancelWorkout: () => Promise<void>;
  finishWorkout: () => Promise<CompletedWorkout | null>;
  addExercises: (exercises: ExerciseCatalogItem[]) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  retryWorkoutSync: (workoutId: string) => Promise<void>;
  updateSet: (exerciseId: string, setId: string, values: { weightKg?: number; reps?: number; completed?: boolean }) => void;
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

export function WorkoutProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const history = useWorkoutHistory(userId);
  const pbTracking = usePbTracking(userId);
  const favoriteWorkouts = useFavoriteWorkouts(userId);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [activeLoading, setActiveLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!userId) {
        setActiveWorkout(null);
        setLoadedUserId(null);
        setActiveLoading(false);
        return;
      }

      setActiveLoading(true);
      try {
        const active = await loadActiveWorkout(userId);
        if (mounted) {
          setActiveWorkout(active);
        }
      } catch (error) {
        console.warn('Unable to restore workout data.', error);
        if (mounted) {
          setActiveWorkout(null);
        }
      } finally {
        if (mounted) {
          setLoadedUserId(userId);
          setActiveLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const completedWorkouts = useMemo(
    () => history.records.map((record) => record.workout),
    [history.records],
  );
  const workoutSyncStatus = useMemo(
    () =>
      Object.fromEntries(
        history.records.map((record) => [record.workout.id, record.syncStatus]),
      ) as Record<string, WorkoutSyncStatus>,
    [history.records],
  );

  const booting =
    Boolean(userId) &&
    (activeLoading ||
      loadedUserId !== userId ||
      history.loading ||
      pbTracking.booting ||
      favoriteWorkouts.booting);

  async function startNewWorkout() {
    if (!userId) throw new Error('You must be signed in to start a workout.');
    const workout = createWorkoutDraft();
    setActiveWorkout(workout);
    await saveActiveWorkout(userId, workout);
    return workout;
  }

  async function startWorkoutFromCompleted(workoutId: string) {
    if (!userId) throw new Error('You must be signed in to start a workout.');
    const completedWorkout = completedWorkouts.find((workout) => workout.id === workoutId);
    if (!completedWorkout) return null;

    const workout = createWorkoutDraftFromCompleted(completedWorkout);
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
    const completedExercises = filterCompletedExercises(activeWorkout.exercises);
    const completed: CompletedWorkout = {
      ...activeWorkout,
      status: 'completed',
      completedAt,
      durationSeconds: Math.max(
        1,
        Math.round((new Date(completedAt).getTime() - new Date(activeWorkout.startedAt).getTime()) / 1000),
      ),
      exercises: completedExercises,
    };

    await history.addCompletedWorkout(completed);
    await clearActiveWorkout(userId);
    setActiveWorkout(null);
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

  function addExercises(exercises: ExerciseCatalogItem[]) {
    updateActive((current) => {
      const existingCatalogIds = new Set(
        current.exercises
          .map((exercise) => exercise.catalogExerciseId)
          .filter((id): id is string => Boolean(id)),
      );
      const newExercises = exercises
        .filter((exercise) => !existingCatalogIds.has(exercise.id))
        .map(createExercise);

      return { ...current, exercises: [...current.exercises, ...newExercises] };
    });
  }

  function removeExercise(exerciseId: string) {
    updateActive((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
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
        workoutSyncStatus,
        booting,
        historyRefreshing: history.refreshing,
        historyError: history.cloudError,
        favoriteWorkoutIds: favoriteWorkouts.favoriteWorkoutIds,
        favoriteWorkoutErrors: favoriteWorkouts.errors,
        favoriteWorkoutPendingIds: favoriteWorkouts.pendingWorkoutIds,
        trackedPbExerciseIds: pbTracking.trackedExerciseIds,
        pbTrackingErrors: pbTracking.errors,
        pbTrackingPendingIds: pbTracking.pendingExerciseIds,
        toggleFavoriteWorkout: favoriteWorkouts.toggle,
        togglePbTracking: pbTracking.toggle,
        startNewWorkout,
        startWorkoutFromCompleted,
        cancelWorkout,
        finishWorkout,
        addExercises,
        removeExercise,
        addSet,
        retryWorkoutSync: history.retryWorkoutSync,
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
