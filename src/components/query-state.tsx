import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { describeError } from '@/lib/describe-error';

type QueryStateProps<T> = {
  query: UseQueryResult<T, Error>;
  isEmpty: (data: T) => boolean;
  emptyTitle: string;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
};

export function QueryState<T>({
  query,
  isEmpty,
  emptyTitle,
  emptyMessage,
  children,
}: QueryStateProps<T>) {
  const theme = useTheme();
  const { data } = query;

  if (data === undefined) {
    if (query.isError) {
      return (
        <View style={styles.center}>
          <ThemedText type="subtitle" accessibilityRole="alert" style={styles.message}>
            Something went wrong
          </ThemedText>
          <ThemedText themeColor="error" style={styles.message}>
            {describeError(query.error)}
          </ThemedText>
          <AppButton label="Retry" onPress={() => void query.refetch()} />
        </View>
      );
    }
    return (
      <View
        style={styles.center}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isEmpty(data)) {
    return (
      <View style={styles.center}>
        <ThemedText type="subtitle" style={styles.message}>
          {emptyTitle}
        </ThemedText>
        {emptyMessage ? (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {emptyMessage}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  return <>{children(data)}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
});