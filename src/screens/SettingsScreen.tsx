import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { deleteAccount, signOut } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";
import { AppHeader } from "../components/AppHeader";
import { Screen } from "../components/Screen";
import { ProfileCard } from "../components/settings/ProfileCard";
import { DeleteAccountCard } from "../components/settings/DeleteAccountCard";
import { SignOutButton } from "../components/settings/SignOutButton";
import { TrainingTargetCard } from "../components/settings/TrainingTargetCard";
import { getUserDisplayName, getUserInitials } from "../lib/user";
import { useTrainingTarget } from "../profile/useTrainingTarget";

export function SettingsScreen() {
  const { session } = useAuth();
  const trainingTarget = useTrainingTarget();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const user = session?.user;
  const name = getUserDisplayName(user);
  const email = user?.email ?? "No email available";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        "Sign out failed",
        error instanceof Error ? error.message : "Please try again.",
      );
      setSigningOut(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;

    setDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteAccount();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete your account. Please try again.",
      );
      setDeleting(false);
    }
  }

  return (
    <Screen edges={["top", "right", "left"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-32">
          <AppHeader />

          <View className="pb-8 pt-8">
            <Text className="text-[32px] font-extrabold tracking-tight text-on-surface">
              Settings
            </Text>
            <Text className="mt-2 text-base leading-6 text-on-surface-variant">
              Manage your profile and weekly training target.
            </Text>
          </View>

          <View className="gap-7 mb-6">
            <ProfileCard
              email={email}
              initials={getUserInitials(user)}
              name={name}
            />
            <TrainingTargetCard
              error={trainingTarget.error}
              hasChanges={trainingTarget.hasChanges}
              onChange={trainingTarget.setDraftTarget}
              onSave={() => void trainingTarget.save()}
              saving={trainingTarget.saving}
              value={trainingTarget.draftTarget}
            />
            <SignOutButton loading={signingOut} onPress={handleSignOut} />
            <DeleteAccountCard
              error={deleteError}
              loading={deleting}
              onDelete={() => void handleDeleteAccount()}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
