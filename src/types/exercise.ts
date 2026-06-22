export type ExerciseCatalogItem = {
  id: string;
  name: string;
  primaryMuscle: string | null;
  equipment: string | null;
  imageUrl: string | null;
  isCustom: boolean;
};
