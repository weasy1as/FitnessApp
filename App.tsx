import './global.css';

import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthSession } from './src/auth/useAuthSession';
import { Screen } from './src/components/Screen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { session, booting } = useAuthSession();

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

  return session ? <HomeScreen session={session} /> : <AuthScreen />;
}
