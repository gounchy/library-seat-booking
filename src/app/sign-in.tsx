import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { describeError } from '@/lib/describe-error';
import { useAuthStore } from '@/store/auth-store';

export default function SignInScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      signIn(credentials.username, credentials.password),
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle" accessibilityRole="header">
            Library Seat Booking
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Sign in with your student ID to book a study seat.
          </ThemedText>

          <View style={styles.field}>
            <ThemedText type="smallBold">Student ID</ThemedText>
            <AppTextInput
              accessibilityLabel="Student ID"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Password</ThemedText>
            <AppTextInput
              accessibilityLabel="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {mutation.error ? (
            <ThemedText themeColor="error" accessibilityRole="alert">
              {describeError(mutation.error)}
            </ThemedText>
          ) : null}

          <AppButton
            label={mutation.isPending ? 'Signing in…' : 'Sign in'}
            disabled={mutation.isPending}
            onPress={() => mutation.mutate({ username, password })}
          />

          {__DEV__ ? (
            <ThemedText type="small" themeColor="textSecondary">
              Demo account: 1923050808 / library123
            </ThemedText>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
  field: { gap: Spacing.two },
});