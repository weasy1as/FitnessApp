import { Image, Text, View } from 'react-native';

const gymflowLogo = require('../../assets/gymflow-logo.png');

export function AppHeader() {
  return (
    <View className="h-20 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 overflow-hidden rounded-2xl bg-primary shadow-sm">
          <Image
            accessibilityIgnoresInvertColors
            className="h-full w-full"
            resizeMode="cover"
            source={gymflowLogo}
          />
        </View>
        <View>
          <Text className="text-[24px] font-extrabold tracking-tight text-on-surface">GymFlow</Text>
          <Text className="mt-0.5 text-xs font-bold uppercase tracking-widest text-secondary">
            Train. Track. Progress.
          </Text>
        </View>
      </View>
    </View>
  );
}
