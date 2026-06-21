import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { signIn, signUp } from '../auth/authService';
import { AuthForm, type AuthMode } from '../components/AuthForm';
import { BrandHeader } from '../components/BrandHeader';
import { Screen } from '../components/Screen';
import { hasSupabaseConfig } from '../lib/supabase';

const configMessage = 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable authentication.';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(hasSupabaseConfig ? null : configMessage);
  const isSignUp = mode === 'signUp';

  async function submit() {
    if (!hasSupabaseConfig) {
      setNotice(configMessage);
      return;
    }
    if (!email.trim() || !password) {
      setNotice('Enter your email and password.');
      return;
    }
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      setNotice('Add your first and last name.');
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      if (isSignUp) {
        const data = await signUp(firstName, lastName, email, password);
        if (!data.session) {
          setMode('signIn');
          setNotice('Account created. Check your email to confirm it, then sign in.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="min-h-full justify-center px-5 pb-10 pt-6">
            <BrandHeader />
            <View className="mb-7">
              <Text className="mb-2 text-xs font-extrabold tracking-widest text-secondary">CONSISTENT STRENGTH</Text>
              <Text className="mb-2.5 text-[34px] font-extrabold leading-10 tracking-tight text-on-surface">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Text>
              <Text className="max-w-[320px] text-base leading-6 text-on-surface-variant">
                {isSignUp ? 'Start tracking your training with a calm, focused logbook.' : 'Sign in to continue building your training history.'}
              </Text>
            </View>

            <AuthForm
              email={email}
              firstName={firstName}
              lastName={lastName}
              loading={loading}
              mode={mode}
              notice={notice}
              onEmailChange={setEmail}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onModeChange={(next) => {
                setMode(next);
                setNotice(hasSupabaseConfig ? null : configMessage);
              }}
              onPasswordChange={setPassword}
              onSubmit={submit}
              password={password}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
