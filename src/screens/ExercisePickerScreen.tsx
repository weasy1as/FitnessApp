import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { ExerciseCatalogRow } from '../components/exercises/ExerciseCatalogRow';
import { ExerciseFilterChips } from '../components/exercises/ExerciseFilterChips';
import { Screen } from '../components/Screen';
import { useExerciseCatalog } from '../exercises/useExerciseCatalog';
import { useWorkouts } from '../workouts/WorkoutContext';

export function ExercisePickerScreen() {
  const router = useRouter();
  const { activeWorkout, addExercises } = useWorkouts();
  const { exercises, loading, error, retry } = useExerciseCatalog();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!activeWorkout) router.replace('/workout');
  }, [activeWorkout, router]);

  const alreadyAddedIds = useMemo(
    () =>
      new Set(
        activeWorkout?.exercises
          .map((exercise) => exercise.catalogExerciseId)
          .filter((id): id is string => Boolean(id)),
      ),
    [activeWorkout],
  );
  const muscles = useMemo(
    () => uniqueValues(exercises.map((exercise) => exercise.primaryMuscle)),
    [exercises],
  );
  const equipmentOptions = useMemo(
    () => uniqueValues(exercises.map((exercise) => exercise.equipment)),
    [exercises],
  );
  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return exercises.filter(
      (exercise) =>
        (!normalizedQuery || exercise.name.toLocaleLowerCase().includes(normalizedQuery)) &&
        (!muscle || exercise.primaryMuscle === muscle) &&
        (!equipment || exercise.equipment === equipment),
    );
  }, [equipment, exercises, muscle, query]);

  function toggleExercise(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const selected = exercises.filter((exercise) => selectedIds.has(exercise.id));
    if (!selected.length) return;
    addExercises(selected);
    router.back();
  }

  return (
    <Screen>
      <View className="h-16 flex-row items-center border-b border-outline px-5">
        <Pressable className="w-12 active:opacity-60" onPress={() => router.back()}>
          <Ionicons color="#131b2e" name="arrow-back" size={24} />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-extrabold text-on-surface">Add exercises</Text>
        <View className="w-12" />
      </View>
      <View className="border-b border-outline bg-surface pb-4 pt-4">
        <View className="mx-5 mb-4 h-12 flex-row items-center gap-3 rounded-2xl border border-outline bg-white px-4">
          <Ionicons color="#6f7583" name="search" size={20} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 text-base text-on-surface"
            onChangeText={setQuery}
            placeholder="Search exercises"
            placeholderTextColor="#6f7583"
            returnKeyType="search"
            value={query}
          />
          {query ? (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}>
              <Ionicons color="#6f7583" name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>
        <View className="gap-4">
          <ExerciseFilterChips label="Muscle" onSelect={setMuscle} options={muscles} selected={muscle} />
          <ExerciseFilterChips label="Equipment" onSelect={setEquipment} options={equipmentOptions} selected={equipment} />
        </View>
      </View>
      {loading ? (
        <CenteredState icon="barbell-outline" loading message="Loading exercise catalog..." />
      ) : error ? (
        <CenteredState icon="cloud-offline-outline" message={error} onRetry={() => void retry()} />
      ) : (
        <FlatList
          contentContainerClassName="gap-3 py-5"
          data={filteredExercises}
          keyExtractor={(exercise) => exercise.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<CenteredState icon="search-outline" message="No exercises match those filters." />}
          renderItem={({ item }) => (
            <ExerciseCatalogRow
              alreadyAdded={alreadyAddedIds.has(item.id)}
              exercise={item}
              onToggle={() => toggleExercise(item.id)}
              selected={selectedIds.has(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View className="border-t border-outline bg-surface px-5 py-4">
        <Pressable
          className={selectedIds.size ? 'h-14 items-center justify-center rounded-2xl bg-primary active:opacity-80' : 'h-14 items-center justify-center rounded-2xl bg-outline opacity-60'}
          disabled={!selectedIds.size}
          onPress={handleAdd}
        >
          <Text className="text-base font-extrabold text-white">
            {selectedIds.size
              ? `Add ${selectedIds.size} ${selectedIds.size === 1 ? 'exercise' : 'exercises'}`
              : 'Select exercises'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function uniqueValues(values: (string | null)[]) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function CenteredState({ icon, message, loading = false, onRetry }: { icon: keyof typeof Ionicons.glyphMap; message: string; loading?: boolean; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      {loading ? <ActivityIndicator color="#0058bc" /> : <Ionicons color="#6f7583" name={icon} size={32} />}
      <Text className="text-center text-sm leading-5 text-on-surface-variant">{message}</Text>
      {onRetry ? (
        <Pressable className="rounded-2xl bg-primary px-5 py-3 active:opacity-80" onPress={onRetry}>
          <Text className="font-extrabold text-white">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
