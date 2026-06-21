import { Text, View } from 'react-native';

import { Screen } from './Screen';

export function PlaceholderScreen({ name }: { name: string }) {
  return (
    <Screen edges={['top', 'right', 'left']}>
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-[32px] font-extrabold tracking-tight text-on-surface">{name}</Text>
      </View>
    </Screen>
  );
}
