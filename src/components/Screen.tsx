import type { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  edges?: readonly Edge[];
}>;

export function Screen({ children, edges = ['top', 'right', 'bottom', 'left'] }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={edges}>
      <StatusBar style="dark" />
      {children}
    </SafeAreaView>
  );
}
