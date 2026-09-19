import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export function AccountBar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.name}>
        Signed in as {user?.studentName ?? 'unknown'}
      </ThemedText>
      <AppButton variant="secondary" label="Sign out" onPress={() => void signOut()} />
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