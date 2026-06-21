import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

export type AuthMode = 'signIn' | 'signUp';

type Props = {
  mode: AuthMode;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  notice: string | null;
  loading: boolean;
  onModeChange: (mode: AuthMode) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function AuthForm(props: Props) {
  const isSignUp = props.mode === 'signUp';

  return (
    <View className="rounded-3xl border border-outline bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row rounded-2xl border border-outline bg-surface-container-low p-1">
        <ModeButton active={!isSignUp} label="Sign in" onPress={() => props.onModeChange('signIn')} />
        <ModeButton active={isSignUp} label="Sign up" onPress={() => props.onModeChange('signUp')} />
      </View>

      {isSignUp ? (
        <>
          <Field autoCapitalize="words" label="First name" onChangeText={props.onFirstNameChange} value={props.firstName} />
          <Field autoCapitalize="words" label="Last name" onChangeText={props.onLastNameChange} value={props.lastName} />
        </>
      ) : null}

      <Field keyboardType="email-address" label="Email" onChangeText={props.onEmailChange} textContentType="emailAddress" value={props.email} />
      <Field label="Password" onChangeText={props.onPasswordChange} secureTextEntry textContentType={isSignUp ? 'newPassword' : 'password'} value={props.password} />

      {props.notice ? (
        <View className="mb-4 rounded-2xl border border-outline bg-surface-container p-3.5">
          <Text className="text-sm leading-5 text-on-surface-variant">{props.notice}</Text>
        </View>
      ) : null}

      <Pressable
        className={'mt-1 h-[58px] items-center justify-center rounded-[18px] bg-primary shadow-sm active:scale-[0.99] active:opacity-75 ' + (props.loading ? 'opacity-60' : '')}
        disabled={props.loading}
        onPress={props.onSubmit}
      >
        {props.loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-base font-extrabold text-on-primary">{isSignUp ? 'Create account' : 'Sign in'}</Text>}
      </Pressable>

      <Text className="mt-4 text-center text-[13px] leading-[19px] text-on-surface-variant">
        {isSignUp ? 'Your name is saved for display on your GymFlow home screen.' : 'Your training log stays synced with your GymFlow account.'}
      </Text>
    </View>
  );
}

type FieldProps = Pick<ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'keyboardType' | 'secureTextEntry' | 'textContentType' | 'autoCapitalize'> & {
  label: string;
};

function Field({ label, ...props }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-extrabold uppercase tracking-widest text-secondary">{label}</Text>
      <TextInput
        {...props}
        autoCorrect={false}
        className="min-h-14 rounded-2xl border border-outline bg-surface-container-low px-4 text-base text-on-surface"
        placeholder={label === 'Email' ? 'you@example.com' : label}
        placeholderTextColor="rgba(65,71,85,0.5)"
      />
    </View>
  );
}

function ModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable className={'flex-1 items-center rounded-xl py-3 active:opacity-75 ' + (active ? 'bg-accent' : '')} onPress={onPress}>
      <Text className={'text-[13px] font-extrabold uppercase tracking-wide ' + (active ? 'text-on-accent' : 'text-on-surface-variant')}>{label}</Text>
    </Pressable>
  );
}
