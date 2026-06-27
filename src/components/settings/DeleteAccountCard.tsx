import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  error?: string;
  loading: boolean;
  onDelete: () => void;
};

export function DeleteAccountCard({ error, loading, onDelete }: Props) {
  const [visible, setVisible] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const confirmed = confirmation === 'DELETE';

  useEffect(() => {
    if (!visible) {
      setConfirmation('');
    }
  }, [visible]);

  function close() {
    if (!loading) {
      setVisible(false);
    }
  }

  return (
    <>
      <View>
        <Text className="mb-3 px-1 text-xs font-extrabold uppercase tracking-widest text-[#ba1a1a]">
          Danger zone
        </Text>
        <Pressable
          accessibilityHint="Permanently delete your GymFlow account and data"
          accessibilityRole="button"
          className="h-16 flex-row items-center rounded-3xl border border-[#ffdad6] bg-white px-5 shadow-sm active:opacity-70"
          onPress={() => setVisible(true)}
        >
          <Ionicons color="#ba1a1a" name="trash-outline" size={25} />
          <Text className="ml-3 flex-1 text-base font-extrabold text-[#ba1a1a]">Delete account</Text>
          <Ionicons color="#c1c6d7" name="chevron-forward" size={22} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={close}
        presentationStyle="overFullScreen"
        transparent
        visible={visible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/40"
        >
          <Pressable accessibilityRole="button" className="flex-1" onPress={close} />
          <View className="rounded-t-[32px] bg-surface px-6 pb-10 pt-7">
            <View className="mb-5 h-12 w-12 items-center justify-center rounded-full bg-[#ffdad6]">
              <Ionicons color="#ba1a1a" name="warning-outline" size={27} />
            </View>

            <Text className="text-2xl font-extrabold text-on-surface">Delete your account?</Text>
            <Text className="mt-3 text-base leading-6 text-on-surface-variant">
              This permanently deletes your account, workout history, favorites, PB settings, and
              local workout drafts. This cannot be undone.
            </Text>

            <Text className="mb-2 mt-6 text-xs font-extrabold uppercase tracking-widest text-secondary">
              Type DELETE to confirm
            </Text>
            <TextInput
              accessibilityLabel="Type DELETE to confirm account deletion"
              autoCapitalize="characters"
              autoCorrect={false}
              className="h-14 rounded-2xl border border-outline bg-white px-4 text-base text-on-surface"
              editable={!loading}
              onChangeText={setConfirmation}
              placeholder="DELETE"
              placeholderTextColor="#777d8c"
              value={confirmation}
            />

            {error ? (
              <Text accessibilityRole="alert" className="mt-3 text-sm leading-5 text-[#ba1a1a]">
                {error}
              </Text>
            ) : null}

            <View className="mt-7 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className="h-14 flex-1 items-center justify-center rounded-2xl border border-outline bg-white active:opacity-70"
                disabled={loading}
                onPress={close}
              >
                <Text className="text-base font-extrabold text-primary">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className={
                  'h-14 flex-1 items-center justify-center rounded-2xl bg-[#ba1a1a] active:opacity-70 ' +
                  (!confirmed || loading ? 'opacity-40' : '')
                }
                disabled={!confirmed || loading}
                onPress={onDelete}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-base font-extrabold text-white">Delete forever</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
