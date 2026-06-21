import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { signOut } from '../auth/authService';
import { useAuth } from '../auth/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { ProfileCard } from '../components/settings/ProfileCard';
import { SignOutButton } from '../components/settings/SignOutButton';
import { TrainingTargetCard } from '../components/settings/TrainingTargetCard';
import { getUserDisplayName, getUserInitials } from '../lib/user';
import type { TrainingTarget } from '../types/settings';

export function SettingsScreen() {
  const { session } = useAuth();
  const [trainingTarget, setTrainingTarget] = useState<TrainingTarget>(4);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const name = getUserDisplayName(user);
  const email = user?.email ?? 'No email available';

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.');
      setSigningOut(false);
    }
  }

  return (
    <Screen edges={['top', 'right', 'left']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-10">
          <AppHeader />

          <View className="pb-8 pt-8">
            <Text className="text-[32px] font-extrabold tracking-tight text-on-surface">Settings</Text>
            <Text className="mt-2 text-base leading-6 text-on-surface-variant">
              Manage your profile and weekly training target.
            </Text>
          </View>

          <View className="gap-7">
            <ProfileCard email={email} initials={getUserInitials(user)} name={name} />
            <TrainingTargetCard onChange={setTrainingTarget} value={trainingTarget} />
            <SignOutButton loading={signingOut} onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
