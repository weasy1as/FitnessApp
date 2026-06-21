import type { Session } from '@supabase/supabase-js';
import { Alert, Pressable, Text, View } from 'react-native';

import { signOut } from '../auth/authService';
import { BrandHeader } from '../components/BrandHeader';
import { Screen } from '../components/Screen';

export function HomeScreen({ session }: { session: Session }) {
  const metadata = session.user.user_metadata;
  const name =
    (typeof metadata?.full_name === 'string' && metadata.full_name.trim()) ||
    (typeof metadata?.first_name === 'string' && metadata.first_name.trim()) ||
    session.user.email ||
    'athlete';

  async function logout() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center px-5">
        <BrandHeader />
        <View className="mb-7 mt-6">
          <Text className="mb-2 text-xs font-extrabold tracking-widest text-secondary">HOME</Text>
          <Text className="mb-2.5 text-[34px] font-extrabold leading-10 tracking-tight text-on-surface">Welcome, {name}</Text>
          <Text className="text-base leading-6 text-on-surface-variant">Your workout dashboard will live here next.</Text>
        </View>

        <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
          <Text className="mb-1.5 text-xl font-extrabold text-on-surface">Signed in</Text>
          <Text className="text-[15px] text-on-surface-variant">{session.user.email}</Text>
          <Pressable className="mt-[22px] h-[52px] items-center justify-center rounded-2xl border-2 border-primary active:opacity-75" onPress={logout}>
            <Text className="text-sm font-extrabold uppercase tracking-wide text-primary">Sign out</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
