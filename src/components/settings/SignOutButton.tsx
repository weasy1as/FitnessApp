import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  loading: boolean;
  onPress: () => void;
};

export function SignOutButton({ loading, onPress }: Props) {
  return (
    <Pressable
      className={'h-16 flex-row items-center rounded-3xl border border-outline bg-white px-5 shadow-sm active:opacity-70 ' + (loading ? 'opacity-60' : '')}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#0058bc" />
      ) : (
        <>
          <Ionicons color="#0058bc" name="log-out-outline" size={25} />
          <Text className="ml-3 flex-1 text-base font-extrabold text-primary">Sign out</Text>
          <Ionicons color="#c1c6d7" name="chevron-forward" size={22} />
        </>
      )}
    </Pressable>
  );
}
