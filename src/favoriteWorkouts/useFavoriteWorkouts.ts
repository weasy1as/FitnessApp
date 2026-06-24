import { useEffect, useState } from 'react';

import { loadFavoriteWorkoutIds, saveFavoriteWorkout } from './favoriteWorkoutService';

export function useFavoriteWorkouts(userId: string | undefined) {
  const [favoriteWorkoutIds, setFavoriteWorkoutIds] = useState<Set<string>>(() => new Set());
  const [pendingWorkoutIds, setPendingWorkoutIds] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setFavoriteWorkoutIds(new Set());
    setPendingWorkoutIds(new Set());
    setErrors({});

    if (!userId) {
      setLoadedUserId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadFavoriteWorkoutIds(userId)
      .then((ids) => {
        if (active) setFavoriteWorkoutIds(new Set(ids));
      })
      .catch((error: unknown) => {
        if (active) {
          console.warn('Unable to load favorite workouts.', error);
          setFavoriteWorkoutIds(new Set());
        }
      })
      .finally(() => {
        if (active) {
          setLoadedUserId(userId);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  async function toggle(workoutId: string) {
    if (!userId || pendingWorkoutIds.has(workoutId)) return;
    const enabled = !favoriteWorkoutIds.has(workoutId);

    setFavoriteWorkoutIds((current) => updateSet(current, workoutId, enabled));
    setPendingWorkoutIds((current) => updateSet(current, workoutId, true));
    setErrors((current) => omitKey(current, workoutId));

    try {
      await saveFavoriteWorkout(userId, workoutId, enabled);
    } catch (error) {
      setFavoriteWorkoutIds((current) => updateSet(current, workoutId, !enabled));
      setErrors((current) => ({
        ...current,
        [workoutId]: error instanceof Error ? error.message : 'Unable to save favorite workout.',
      }));
    } finally {
      setPendingWorkoutIds((current) => updateSet(current, workoutId, false));
    }
  }

  return {
    booting: Boolean(userId) && (loading || loadedUserId !== userId),
    errors,
    favoriteWorkoutIds,
    pendingWorkoutIds,
    toggle,
  };
}

function updateSet(current: Set<string>, value: string, included: boolean) {
  const next = new Set(current);
  if (included) next.add(value);
  else next.delete(value);
  return next;
}

function omitKey(values: Record<string, string>, key: string) {
  const next = { ...values };
  delete next[key];
  return next;
}
