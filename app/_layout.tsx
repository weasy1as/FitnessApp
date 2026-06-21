import '../global.css';

import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { Screen } from '../src/components/Screen';
import { WorkoutProvider, useWorkouts } from '../src/workouts/WorkoutContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkoutProvider>
          <RootNavigator />
        </WorkoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { session, booting: authBooting } = useAuth();
  const { booting: workoutsBooting } = useWorkouts();
  const booting = authBooting || (Boolean(session) && workoutsBooting);

  if (booting) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#0058bc" />
          <Text className="text-[15px] text-on-surface-variant">Loading GymFlow...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/active" />
      </Stack.Protected>
    </Stack>
  );
}
