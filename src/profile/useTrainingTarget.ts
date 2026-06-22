import { useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { getTrainingTarget } from '../lib/user';
import type { TrainingTarget } from '../types/settings';
import { saveTrainingTarget } from './profileService';

export function useTrainingTarget() {
  const { session } = useAuth();
  const user = session?.user;
  const metadataTarget = getTrainingTarget(user);
  const [savedTarget, setSavedTarget] = useState<TrainingTarget>(metadataTarget);
  const [draftTarget, setDraftTarget] = useState<TrainingTarget>(metadataTarget);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedTarget(metadataTarget);
    setDraftTarget(metadataTarget);
    setError(null);
  }, [metadataTarget, user?.id]);

  async function save() {
    if (saving || draftTarget === savedTarget) return;

    setSaving(true);
    setError(null);
    try {
      const updatedUser = await saveTrainingTarget(draftTarget);
      const confirmedTarget = getTrainingTarget(updatedUser);
      setSavedTarget(confirmedTarget);
      setDraftTarget(confirmedTarget);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your training target.');
    } finally {
      setSaving(false);
    }
  }

  return {
    draftTarget,
    error,
    hasChanges: draftTarget !== savedTarget,
    saving,
    save,
    setDraftTarget,
  };
}
