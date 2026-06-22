import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { TrainingTarget } from '../../types/settings';

const targets: TrainingTarget[] = [1, 2, 3, 4, 5, 6, 7];

type Props = {
  error: string | null;
  hasChanges: boolean;
  onChange: (target: TrainingTarget) => void;
  onSave: () => void;
  saving: boolean;
  value: TrainingTarget;
};

export function TrainingTargetCard({ error, hasChanges, onChange, onSave, saving, value }: Props) {
  return (
    <View>
      <Text className="mb-3 px-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Training target</Text>
      <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
        <Text className="text-lg font-bold text-on-surface">Sessions per week</Text>
        <Text className="mt-1 text-sm leading-5 text-on-surface-variant">
          Choose how often you plan to train each week.
        </Text>

        <View className="mt-5 flex-row rounded-2xl border border-outline bg-surface-container-low p-1">
          {targets.map((target) => {
            const selected = target === value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={'h-12 flex-1 items-center justify-center rounded-xl active:opacity-70 ' + (selected ? 'bg-accent' : '')}
                key={target}
                onPress={() => onChange(target)}
              >
                <Text className={'text-base font-bold ' + (selected ? 'text-on-accent' : 'text-on-surface')}>
                  {target}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text className="mt-4 text-sm leading-5 text-[#ba1a1a]">{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          className={
            'mt-5 h-12 items-center justify-center rounded-2xl ' +
            (hasChanges && !saving ? 'bg-primary active:opacity-80' : 'bg-surface-container')
          }
          disabled={!hasChanges || saving}
          onPress={onSave}
        >
          {saving ? (
            <ActivityIndicator color="#5b5f62" />
          ) : (
            <Text className={'text-base font-extrabold ' + (hasChanges ? 'text-on-primary' : 'text-on-surface-variant')}>
              Save target
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
