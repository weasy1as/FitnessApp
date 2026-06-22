import { requireSupabase } from '../lib/supabase';
import type { ExerciseCatalogItem } from '../types/exercise';

type ExerciseRow = {
  id: string;
  name: string;
  primary_muscle: string | null;
  equipment: string | null;
  image_url: string | null;
  is_custom: boolean | null;
};

let catalogCache: ExerciseCatalogItem[] | null = null;

export async function loadExerciseCatalog(forceRefresh = false): Promise<ExerciseCatalogItem[]> {
  if (catalogCache && !forceRefresh) return catalogCache;

  const { data, error } = await requireSupabase()
    .from('exercises')
    .select('id,name,primary_muscle,equipment,image_url,is_custom')
    .order('name');

  if (error) throw error;

  catalogCache = ((data ?? []) as ExerciseRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    primaryMuscle: row.primary_muscle,
    equipment: row.equipment,
    imageUrl: row.image_url,
    isCustom: row.is_custom ?? false,
  }));
  return catalogCache;
}
