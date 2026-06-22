import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import type { ExerciseCatalogItem } from '../../types/exercise';

type Props = { exercise: ExerciseCatalogItem; selected: boolean; alreadyAdded: boolean; onToggle: () => void };

export function ExerciseCatalogRow({ exercise, selected, alreadyAdded, onToggle }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(exercise.imageUrl) && !imageFailed;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: alreadyAdded }}
      className={alreadyAdded ? 'mx-5 flex-row items-center gap-4 rounded-3xl border border-outline bg-surface-container-low p-3 opacity-60' : selected ? 'mx-5 flex-row items-center gap-4 rounded-3xl border-2 border-primary bg-[#eef5ff] p-3' : 'mx-5 flex-row items-center gap-4 rounded-3xl border border-outline bg-white p-3 active:opacity-70'}
      disabled={alreadyAdded}
      onPress={onToggle}
    >
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-surface-container">
        {showImage ? <Image className="h-full w-full" onError={() => setImageFailed(true)} resizeMode="cover" source={{ uri: exercise.imageUrl ?? undefined }} /> : <Ionicons color="#6f7583" name="barbell-outline" size={27} />}
      </View>
      <View className="flex-1">
        <Text className="text-base font-extrabold leading-6 text-on-surface">{exercise.name}</Text>
        <Text className="mt-1 text-sm capitalize text-on-surface-variant">{[exercise.primaryMuscle, exercise.equipment].filter(Boolean).join(' · ') || 'Exercise'}</Text>
        {alreadyAdded ? <Text className="mt-1 text-xs font-bold uppercase tracking-wide text-secondary">Already added</Text> : null}
      </View>
      <View className={selected ? 'h-7 w-7 items-center justify-center rounded-full bg-primary' : 'h-7 w-7 items-center justify-center rounded-full border-2 border-outline'}>
        {selected ? <Ionicons color="white" name="checkmark" size={19} /> : null}
      </View>
    </Pressable>
  );
}
