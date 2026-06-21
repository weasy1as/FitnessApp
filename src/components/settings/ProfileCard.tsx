import { Text, View } from 'react-native';

type Props = {
  email: string;
  initials: string;
  name: string;
};

export function ProfileCard({ email, initials, name }: Props) {
  return (
    <View>
      <Text className="mb-3 px-1 text-xs font-extrabold uppercase tracking-widest text-secondary">Profile</Text>
      <View className="flex-row items-center rounded-3xl border border-outline bg-white p-5 shadow-sm">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-primary">
          <Text className="text-lg font-extrabold text-on-primary">{initials}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-xl font-bold text-on-surface">{name}</Text>
          <Text className="mt-1 text-sm text-on-surface-variant">{email}</Text>
        </View>
      </View>
    </View>
  );
}
