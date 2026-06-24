import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import {
  buildSelectedExerciseWeightHistory,
  calculateExerciseProgressSummaries,
  findRecentPrs,
  getExerciseOptions,
} from '../lib/progress';
import { useProgressHistory } from '../progress/useProgressHistory';
import type {
  ExerciseProgressPoint,
  ExerciseProgressSummary,
  ProgressTimeframe,
  RecentPr,
} from '../types/progress';

const TIMEFRAMES: { label: string; value: ProgressTimeframe }[] = [
  { label: '8 weeks', value: '8w' },
  { label: '30 days', value: '30d' },
];

export function ProgressScreen() {
  const [timeframe, setTimeframe] = useState<ProgressTimeframe>('8w');
  const [query, setQuery] = useState('');
  const [selectedExerciseKey, setSelectedExerciseKey] = useState<string | null>(null);
  const { allTimeSets, error, loading, retry, timeframeSets } = useProgressHistory(timeframe);

  const summaries = useMemo(() => calculateExerciseProgressSummaries(timeframeSets), [timeframeSets]);
  const exerciseOptions = useMemo(() => getExerciseOptions(summaries), [summaries]);
  const recentPrs = useMemo(() => findRecentPrs(timeframeSets, allTimeSets).slice(0, 4), [allTimeSets, timeframeSets]);
  const selectedExercise = exerciseOptions.find((exercise) => exercise.exerciseKey === selectedExerciseKey) ?? null;
  const chartPoints = useMemo(
    () =>
      selectedExerciseKey
        ? buildSelectedExerciseWeightHistory(timeframeSets, allTimeSets, selectedExerciseKey)
        : [],
    [allTimeSets, selectedExerciseKey, timeframeSets],
  );
  const filteredExercises = exerciseOptions.filter((exercise) => {
    const matchesQuery = exercise.exerciseName.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery;
  });

  useEffect(() => {
    if (!selectedExerciseKey && exerciseOptions[0]) {
      setSelectedExerciseKey(exerciseOptions[0].exerciseKey);
      return;
    }
    if (selectedExerciseKey && !exerciseOptions.some((exercise) => exercise.exerciseKey === selectedExerciseKey)) {
      setSelectedExerciseKey(exerciseOptions[0]?.exerciseKey ?? null);
    }
  }, [exerciseOptions, selectedExerciseKey]);

  return (
    <Screen edges={['top', 'right', 'left']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10">
          <AppHeader />

          <View className="pb-6 pt-8">
            <Text className="text-[32px] font-extrabold tracking-tight text-on-surface">Progress</Text>
            <Text className="mt-2 text-base leading-6 text-on-surface-variant">
              Track kg progression by exercise and recent PRs.
            </Text>
          </View>

          <TimeframeToggle timeframe={timeframe} onChange={setTimeframe} />

          {error ? (
            <View className="mt-5 rounded-3xl border border-outline bg-white p-5">
              <View className="flex-row items-center gap-3">
                <Ionicons color="#00677f" name="cloud-offline-outline" size={24} />
                <Text className="flex-1 text-base font-extrabold text-on-surface">Progress is unavailable</Text>
              </View>
              <Text className="mt-2 text-sm leading-5 text-on-surface-variant">{error}</Text>
              <Pressable className="mt-4 h-11 items-center justify-center rounded-2xl bg-primary" onPress={retry}>
                <Text className="font-extrabold text-on-primary">Try again</Text>
              </Pressable>
            </View>
          ) : loading ? (
            <View className="mt-8 items-center rounded-3xl border border-outline bg-white py-12">
              <ActivityIndicator color="#0058bc" />
              <Text className="mt-3 text-sm font-bold text-on-surface-variant">Loading strength history...</Text>
            </View>
          ) : allTimeSets.length === 0 ? (
            <EmptyState title="No workouts yet" message="Finish a workout with completed sets and progress will appear here." />
          ) : timeframeSets.length === 0 ? (
            <EmptyState title="No recent sets" message="There are workouts in your history, but none inside this timeframe." />
          ) : (
            <View className="mt-5 gap-5">
              <ExerciseSelector
                exercises={filteredExercises}
                onQueryChange={setQuery}
                onSelect={setSelectedExerciseKey}
                query={query}
                selectedExerciseKey={selectedExerciseKey}
              />

              <ProgressChart points={chartPoints} selectedExercise={selectedExercise} />
              <PrHighlights prs={recentPrs} />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function TimeframeToggle({ timeframe, onChange }: { timeframe: ProgressTimeframe; onChange: (timeframe: ProgressTimeframe) => void }) {
  return (
    <View className="flex-row rounded-3xl bg-surface-container p-1">
      {TIMEFRAMES.map((option) => (
        <Pressable
          className={'h-12 flex-1 items-center justify-center rounded-2xl ' + (timeframe === option.value ? 'bg-primary' : 'bg-transparent')}
          key={option.value}
          onPress={() => onChange(option.value)}
        >
          <Text className={'font-extrabold ' + (timeframe === option.value ? 'text-on-primary' : 'text-on-surface-variant')}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ExerciseSelector({
  exercises,
  onQueryChange,
  onSelect,
  query,
  selectedExerciseKey,
}: {
  exercises: ExerciseProgressSummary[];
  onQueryChange: (query: string) => void;
  onSelect: (exerciseKey: string) => void;
  query: string;
  selectedExerciseKey: string | null;
}) {
  return (
    <View className="rounded-3xl border border-outline bg-white p-4">
      <View className="flex-row items-center rounded-2xl bg-surface-container-low px-4">
        <Ionicons color="#414755" name="search" size={18} />
        <TextInput
          className="h-12 flex-1 px-3 text-base text-on-surface"
          onChangeText={onQueryChange}
          placeholder="Search exercises"
          placeholderTextColor="#697080"
          value={query}
        />
      </View>

      <View className="mt-4 gap-2">
        {exercises.length ? (
          exercises.slice(0, 6).map((exercise) => (
            <Pressable
              className={'rounded-2xl border p-3 ' + (selectedExerciseKey === exercise.exerciseKey ? 'border-primary bg-surface-container-low' : 'border-surface-container bg-white')}
              key={exercise.exerciseKey}
              onPress={() => onSelect(exercise.exerciseKey)}
            >
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="font-extrabold text-on-surface">{exercise.exerciseName}</Text>
                  <Text className="mt-1 text-xs font-bold text-on-surface-variant">{exercise.primaryMuscle ?? 'Unassigned'}</Text>
                </View>
                <Text className="text-sm font-extrabold text-secondary">
                  {exercise.increaseKg > 0 ? '+' : ''}{formatKg(exercise.increaseKg)}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text className="py-4 text-center text-sm text-on-surface-variant">No exercises match this view.</Text>
        )}
      </View>
    </View>
  );
}

function ProgressChart({ points, selectedExercise }: { points: ExerciseProgressPoint[]; selectedExercise: ExerciseProgressSummary | null }) {
  const maxWeight = Math.max(...points.map((point) => point.weightKg), 1);
  return (
    <View className="rounded-3xl border border-outline bg-white p-5">
      <Text className="text-xs font-extrabold uppercase tracking-widest text-secondary">Exercise progression</Text>
      <Text className="mt-1 text-2xl font-extrabold text-on-surface">{selectedExercise?.exerciseName ?? 'Select an exercise'}</Text>
      <Text className="mt-1 text-sm text-on-surface-variant">
        {selectedExercise ? `${formatKg(selectedExercise.earliestTopWeightKg)} to ${formatKg(selectedExercise.latestTopWeightKg)}` : 'Choose an exercise to see its top set per workout.'}
      </Text>

      {points.length ? (
        <View className="mt-5">
          <View className="h-40 flex-row items-end gap-2 rounded-2xl bg-surface-container-low p-3">
            {points.map((point) => (
              <View className="flex-1 items-center justify-end gap-2" key={point.key}>
                <Text className="text-[10px] font-extrabold text-on-surface-variant">{formatKg(point.weightKg)}</Text>
                <View
                  className={'w-full rounded-t-xl ' + (point.isPr ? 'bg-accent' : 'bg-primary')}
                  style={{ height: `${Math.max(12, (point.weightKg / maxWeight) * 100)}%` }}
                />
              </View>
            ))}
          </View>
          <View className="mt-3 gap-2">
            {points.slice(-3).map((point) => (
              <View className="flex-row items-center justify-between" key={'label-' + point.key}>
                <Text className="text-xs font-bold text-on-surface-variant">{formatShortDate(point.startedAt)}</Text>
                <Text className="text-xs font-extrabold text-on-surface">
                  {formatKg(point.weightKg)} x {point.reps}{point.isPr ? ' PR' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text className="mt-5 rounded-2xl bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">
          No chart points for this exercise in the selected timeframe.
        </Text>
      )}
    </View>
  );
}

function PrHighlights({ prs }: { prs: RecentPr[] }) {
  return (
    <View className="rounded-3xl border border-outline bg-white p-5">
      <Text className="text-xs font-extrabold uppercase tracking-widest text-secondary">Recent PRs</Text>
      {prs.length ? (
        <View className="mt-3 gap-3">
          {prs.map((pr) => (
            <View className="flex-row items-center gap-3 rounded-2xl bg-surface-container-low p-3" key={pr.exerciseKey + pr.startedAt + pr.weightKg}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-accent">
                <Ionicons color="#005266" name="trophy" size={19} />
              </View>
              <View className="flex-1">
                <Text className="font-extrabold text-on-surface">{pr.exerciseName}</Text>
                <Text className="mt-1 text-xs text-on-surface-variant">{formatShortDate(pr.startedAt)} • {pr.reps} reps</Text>
              </View>
              <Text className="text-base font-extrabold text-secondary">{formatKg(pr.weightKg)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="mt-3 rounded-2xl bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">
          No new records in this timeframe. The next one will stand out here.
        </Text>
      )}
    </View>
  );
}

function EmptyState({ message, title }: { message: string; title: string }) {
  return (
    <View className="mt-8 items-center rounded-3xl border border-outline bg-white px-6 py-10">
      <Ionicons color="#00677f" name="analytics-outline" size={30} />
      <Text className="mt-3 text-lg font-extrabold text-on-surface">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-on-surface-variant">{message}</Text>
    </View>
  );
}

function formatKg(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} kg`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}
