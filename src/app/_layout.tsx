import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { OfflineBanner } from '@/components/offline-banner';
import { startNetworkMonitoring } from '@/lib/network';
import { PERSIST_MAX_AGE, queryClient, queryPersister } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (status !== 'restoring') {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  useEffect(() => startNetworkMonitoring(), []);

  if (status === 'restoring') {
    return null;
  }

  const isSignedIn = status === 'signedIn';

  return (
    <View style={styles.root}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="seat/[id]" />
          <Stack.Screen name="seat/new" />
          <Stack.Screen name="seat/[id]/edit" />
          <Stack.Screen name="book/[seatId]" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});