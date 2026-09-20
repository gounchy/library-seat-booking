import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { setSimulation } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { Spacing } from '@/constants/theme';
import { seatKeys } from '@/features/seats/use-seats';
import { useNetworkStore } from '@/lib/network';
import { queryClient } from '@/lib/query-client';

export function DevPanel() {
  const [expanded, setExpanded] = useState(false);
  const [failAll, setFailAll] = useState(false);
  const forcedOffline = useNetworkStore((s) => s.forcedOffline);
  const setForcedOffline = useNetworkStore((s) => s.setForcedOffline);

  if (!__DEV__) {
    return null;
  }

  const toggleFailAll = () => {
    setSimulation({ failAll: !failAll });
    setFailAll(!failAll);
  };

  return (
    <View style={styles.container}>
      <AppButton
        variant="secondary"
        label={expanded ? 'Hide dev tools' : 'Show dev tools'}
        onPress={() => setExpanded(!expanded)}
      />
      {expanded ? (
        <>
          <AppButton
            variant="secondary"
            label={`Simulate offline: ${forcedOffline ? 'ON' : 'OFF'}`}
            onPress={() => setForcedOffline(!forcedOffline)}
          />
          <AppButton
            variant="secondary"
            label={`Simulate server errors: ${failAll ? 'ON' : 'OFF'}`}
            onPress={toggleFailAll}
          />
          <AppButton
            variant="secondary"
            label="Fail the next request"
            onPress={() => setSimulation({ failNext: true })}
          />
          <AppButton
            variant="secondary"
            label="Clear seats cache and reload"
            onPress={() => void queryClient.resetQueries({ queryKey: seatKeys.all })}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});