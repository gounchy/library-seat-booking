import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { setSimulation } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { seatKeys } from '@/features/seats/use-seats';
import { queryClient } from '@/lib/query-client';

export function DevPanel() {
  const [failAll, setFailAll] = useState(false);

  if (!__DEV__) {
    return null;
  }

  const toggleFailAll = () => {
    setSimulation({ failAll: !failAll });
    setFailAll(!failAll);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Dev tools (hidden in production)
      </ThemedText>
      <AppButton
        variant="secondary"
        label={`Simulate server errors: ${failAll ? 'ON' : 'OFF'}`}
        onPress={toggleFailAll}
      />
      <AppButton
        variant="secondary"
        label="Clear seats cache and reload"
        onPress={() => void queryClient.resetQueries({ queryKey: seatKeys.all })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
});