import type { User } from '@supabase/supabase-js';

import { requireSupabase } from '../lib/supabase';
import type { TrainingTarget } from '../types/settings';

export async function saveTrainingTarget(trainingTarget: TrainingTarget): Promise<User> {
  const { data, error } = await requireSupabase().auth.updateUser({
    data: { training_target: trainingTarget },
  });

  if (error) throw error;
  return data.user;
}
