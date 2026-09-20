import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { selectIsOnline, useNetworkStore } from '@/lib/network';

export function OfflineBanner() {
  const isOnline = useNetworkStore(selectIsOnline);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (isOnline) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: theme.backgroundSelected,
          borderBottomColor: theme.border,
          paddingTop: insets.top + Spacing.two,
        },
      ]}>
      <ThemedText type="smallBold">Offline: showing saved data</ThemedText>
      <ThemedText type="small">Changes cannot be saved until you are back online.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.half,
  },
});