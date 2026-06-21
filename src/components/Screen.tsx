import type { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="dark" />
      {children}
    </SafeAreaView>
  );
}
