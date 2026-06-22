import { useEffect, useState } from 'react';

import { loadTrackedPbExerciseIds, savePbTracking } from './pbTrackingService';

export function usePbTracking(userId: string | undefined) {
  const [trackedExerciseIds, setTrackedExerciseIds] = useState<Set<string>>(() => new Set());
  const [pendingExerciseIds, setPendingExerciseIds] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setTrackedExerciseIds(new Set());
    setPendingExerciseIds(new Set());
    setErrors({});

    if (!userId) {
      setLoadedUserId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadTrackedPbExerciseIds(userId)
      .then((ids) => {
        if (active) setTrackedExerciseIds(new Set(ids));
      })
      .catch((error: unknown) => {
        if (active) {
          console.warn('Unable to load PB tracking preferences.', error);
          setTrackedExerciseIds(new Set());
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

  async function toggle(exerciseId: string) {
    if (!userId || pendingExerciseIds.has(exerciseId)) return;
    const enabled = !trackedExerciseIds.has(exerciseId);

    setTrackedExerciseIds((current) => updateSet(current, exerciseId, enabled));
    setPendingExerciseIds((current) => updateSet(current, exerciseId, true));
    setErrors((current) => omitKey(current, exerciseId));

    try {
      await savePbTracking(userId, exerciseId, enabled);
    } catch (error) {
      setTrackedExerciseIds((current) => updateSet(current, exerciseId, !enabled));
      setErrors((current) => ({
        ...current,
        [exerciseId]: error instanceof Error ? error.message : 'Unable to save PB tracking.',
      }));
    } finally {
      setPendingExerciseIds((current) => updateSet(current, exerciseId, false));
    }
  }

  return {
    booting: Boolean(userId) && (loading || loadedUserId !== userId),
    errors,
    pendingExerciseIds,
    toggle,
    trackedExerciseIds,
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
