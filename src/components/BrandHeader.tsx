import { Text, View } from 'react-native';

export function BrandHeader() {
  return (
    <View className="mb-9 flex-row items-center gap-3">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-sm">
        <Text className="text-[22px] font-extrabold text-on-primary">G</Text>
      </View>
      <Text className="text-[22px] font-extrabold tracking-tight text-primary">GymFlow</Text>
    </View>
  );
}
