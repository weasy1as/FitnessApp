import { useCallback, useEffect, useState } from 'react';

import type { ExerciseCatalogItem } from '../types/exercise';
import { loadExerciseCatalog } from './exerciseCatalogService';

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<ExerciseCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      setExercises(await loadExerciseCatalog(forceRefresh));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load exercises.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { exercises, loading, error, retry: () => load(true) };
}
