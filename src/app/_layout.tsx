import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { queryClient } from '@/lib/query-client';
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

  if (status === 'restoring') {
    return null;
  }

  const isSignedIn = status === 'signedIn';

  return (
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
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}