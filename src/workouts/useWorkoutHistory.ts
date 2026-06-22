import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { CompletedWorkout } from '../types/workout';
import type { StoredWorkoutRecord } from '../types/workoutSync';
import { loadWorkoutRecords, saveWorkoutRecords } from './workoutStorage';
import { loadCloudWorkouts, uploadCompletedWorkout } from './workoutService';

export function useWorkoutHistory(userId: string | undefined) {
  const [records, setRecords] = useState<StoredWorkoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const recordsRef = useRef<StoredWorkoutRecord[]>([]);
  const activeUserIdRef = useRef<string | undefined>(userId);
  const syncingIdsRef = useRef(new Set<string>());

  const persist = useCallback(
    async (nextRecords: StoredWorkoutRecord[]) => {
      if (!userId || activeUserIdRef.current !== userId) return;
      const sortedRecords = sortRecords(nextRecords);
      recordsRef.current = sortedRecords;
      setRecords(sortedRecords);
      await saveWorkoutRecords(userId, sortedRecords);
    },
    [userId],
  );

  const updateRecord = useCallback(
    async (workoutId: string, updater: (record: StoredWorkoutRecord) => StoredWorkoutRecord) => {
      const currentRecord = recordsRef.current.find((record) => record.workout.id === workoutId);
      if (!currentRecord) return;
      await persist(
        recordsRef.current.map((record) =>
          record.workout.id === workoutId ? updater(record) : record,
        ),
      );
    },
    [persist],
  );

  const syncRecord = useCallback(
    async (workoutId: string) => {
      if (!userId || syncingIdsRef.current.has(workoutId)) return;
      const record = recordsRef.current.find((item) => item.workout.id === workoutId);
      if (!record || record.syncStatus === 'synced') return;

      syncingIdsRef.current.add(workoutId);
      try {
        await updateRecord(workoutId, (current) => ({
          ...current,
          syncStatus: 'syncing',
          syncError: undefined,
        }));
        const serverId = await uploadCompletedWorkout(record.workout);
        if (activeUserIdRef.current !== userId) return;
        await updateRecord(workoutId, (current) => ({
          ...current,
          serverId,
          syncStatus: 'synced',
          syncError: undefined,
        }));
      } catch (error) {
        if (activeUserIdRef.current === userId) {
          try {
            await updateRecord(workoutId, (current) => ({
              ...current,
              syncStatus: 'failed',
              syncError: getErrorMessage(error),
            }));
          } catch (storageError) {
            console.warn('Unable to persist workout sync failure.', storageError);
          }
        }
      } finally {
        syncingIdsRef.current.delete(workoutId);
      }
    },
    [updateRecord, userId],
  );

  const syncUnsyncedRecords = useCallback(() => {
    recordsRef.current
      .filter((record) => record.syncStatus === 'pending' || record.syncStatus === 'failed')
      .forEach((record) => {
        void syncRecord(record.workout.id);
      });
  }, [syncRecord]);

  const refreshCloudHistory = useCallback(async () => {
    if (!userId || activeUserIdRef.current !== userId) return;
    setRefreshing(true);
    try {
      const cloudWorkouts = await loadCloudWorkouts(userId);
      if (activeUserIdRef.current !== userId) return;
      await persist(mergeRecords(recordsRef.current, cloudWorkouts));
      setCloudError(null);
    } catch (error) {
      if (activeUserIdRef.current === userId) setCloudError(getErrorMessage(error));
    } finally {
      if (activeUserIdRef.current === userId) setRefreshing(false);
    }
  }, [persist, userId]);

  useEffect(() => {
    activeUserIdRef.current = userId;
    syncingIdsRef.current.clear();
    recordsRef.current = [];
    setRecords([]);
    setCloudError(null);

    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let active = true;
    setLoading(true);

    async function initialize() {
      try {
        const localRecords = await loadWorkoutRecords(userId!);
        if (!active) return;
        recordsRef.current = sortRecords(localRecords);
        setRecords(recordsRef.current);
      } catch (error) {
        console.warn('Unable to restore workout history.', error);
      } finally {
        if (active) setLoading(false);
      }

      if (!active) return;
      await refreshCloudHistory();
      if (active) syncUnsyncedRecords();
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [refreshCloudHistory, syncUnsyncedRecords, userId]);

  useEffect(() => {
    if (!userId) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshCloudHistory();
        syncUnsyncedRecords();
      }
    });
    return () => subscription.remove();
  }, [refreshCloudHistory, syncUnsyncedRecords, userId]);

  const addCompletedWorkout = useCallback(
    async (workout: CompletedWorkout) => {
      const nextRecord: StoredWorkoutRecord = { workout, syncStatus: 'pending' };
      await persist([
        nextRecord,
        ...recordsRef.current.filter((record) => record.workout.id !== workout.id),
      ]);
      void syncRecord(workout.id);
    },
    [persist, syncRecord],
  );

  return {
    records,
    loading,
    refreshing,
    cloudError,
    addCompletedWorkout,
    retryWorkoutSync: syncRecord,
  };
}

function mergeRecords(
  localRecords: StoredWorkoutRecord[],
  cloudWorkouts: { workout: CompletedWorkout; serverId: string }[],
): StoredWorkoutRecord[] {
  const merged = new Map<string, StoredWorkoutRecord>();
  cloudWorkouts.forEach(({ workout, serverId }) => {
    merged.set(workout.id, { workout, serverId, syncStatus: 'synced' });
  });
  localRecords.forEach((record) => {
    if (record.syncStatus !== 'synced' || !merged.has(record.workout.id)) {
      merged.set(record.workout.id, record);
    }
  });
  return sortRecords([...merged.values()]);
}

function sortRecords(records: StoredWorkoutRecord[]) {
  return [...records].sort(
    (a, b) =>
      new Date(b.workout.completedAt).getTime() - new Date(a.workout.completedAt).getTime(),
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to sync workout history.';
}
