import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useOutboxStore } from '@/store/outbox-store';

export function AccountBar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const unsynced = useOutboxStore((s) => s.items.length);

  const handleSignOut = () => {
    if (unsynced === 0) {
      void signOut();
      return;
    }
    Alert.alert(
      'Unsynced changes',
      `You have ${unsynced} change(s) that are not saved to the server yet. Signing out will discard them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
      ],
    );
  };

  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.name}>
        Signed in as {user?.studentName ?? 'unknown'}
      </ThemedText>
      <AppButton variant="secondary" label="Sign out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: { flex: 1 },
});