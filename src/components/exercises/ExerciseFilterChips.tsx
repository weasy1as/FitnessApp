import { Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

export function ExerciseFilterChips({ label, options, selected, onSelect }: Props) {
  return (
    <View className="gap-2">
      <Text className="px-5 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{label}</Text>
      <ScrollView contentContainerClassName="gap-2 px-5" horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false}>
        <FilterChip active={selected === null} label="All" onPress={() => onSelect(null)} />
        {options.map((option) => (
          <FilterChip active={selected === option} key={option} label={option} onPress={() => onSelect(selected === option ? null : option)} />
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable className={active ? 'rounded-full bg-primary px-4 py-2.5' : 'rounded-full border border-outline bg-white px-4 py-2.5 active:opacity-70'} onPress={onPress}>
      <Text className={active ? 'text-sm font-bold capitalize text-white' : 'text-sm font-bold capitalize text-on-surface'}>{label}</Text>
    </Pressable>
  );
}
