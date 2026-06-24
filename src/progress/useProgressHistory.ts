import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { loadProgressSetHistory } from './progressService';
import type { ProgressSetHistoryItem, ProgressTimeframe } from '../types/progress';

export function useProgressHistory(timeframe: ProgressTimeframe) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [timeframeSets, setTimeframeSets] = useState<ProgressSetHistoryItem[]>([]);
  const [allTimeSets, setAllTimeSets] = useState<ProgressSetHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const retry = useCallback(() => setRefreshKey((current) => current + 1), []);

  useEffect(() => {
    if (!userId) {
      setTimeframeSets([]);
      setAllTimeSets([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);

    async function load() {
      try {
        const history = await loadProgressSetHistory(userId!, timeframe);
        if (!active) return;
        setTimeframeSets(history.timeframeSets);
        setAllTimeSets(history.allTimeSets);
        setError(null);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load progress.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [refreshKey, timeframe, userId]);

  return { timeframeSets, allTimeSets, loading, error, retry };
}
