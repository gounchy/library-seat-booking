import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { describeError } from '@/lib/describe-error';
import { validateSeatId, validateZone } from '@/lib/validate-seat';
import type { Seat } from '@/types';

type SeatFormProps = {
  mode: 'create' | 'edit';
  initialValues: Seat;
  submitLabel: string;
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (values: Seat) => void;
};

export function SeatForm({
  mode,
  initialValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: SeatFormProps) {
  const theme = useTheme();
  const [id, setId] = useState(initialValues.id);
  const [zone, setZone] = useState(initialValues.zone);
  const [hasOutlet, setHasOutlet] = useState(initialValues.hasOutlet);
  const [submitted, setSubmitted] = useState(false);

  const idError = mode === 'create' ? validateSeatId(id) : undefined;
  const zoneError = validateZone(zone);

  const handleSubmit = () => {
    setSubmitted(true);
    if (idError || zoneError) {
      return;
    }
    onSubmit({ id: id.trim(), zone: zone.trim(), hasOutlet });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <ThemedText type="smallBold">Seat id</ThemedText>
        {mode === 'create' ? (
          <AppTextInput
            accessibilityLabel="Seat id"
            placeholder="e.g. A07"
            value={id}
            onChangeText={setId}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        ) : (
          <ThemedText>{id}</ThemedText>
        )}
        {submitted && idError ? (
          <ThemedText type="small" themeColor="error" accessibilityRole="alert">
            {idError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Zone</ThemedText>
        <AppTextInput
          accessibilityLabel="Zone"
          placeholder="e.g. A"
          value={zone}
          onChangeText={setZone}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {submitted && zoneError ? (
          <ThemedText type="small" themeColor="error" accessibilityRole="alert">
            {zoneError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.switchRow}>
        <ThemedText>Has power outlet</ThemedText>
        <Switch
          accessibilityRole="switch"
          accessibilityLabel="Has power outlet"
          value={hasOutlet}
          onValueChange={setHasOutlet}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={hasOutlet ? theme.onPrimary : theme.background}
        />
      </View>

      {submitError ? (
        <ThemedText themeColor="error" accessibilityRole="alert">
          {describeError(submitError)}
        </ThemedText>
      ) : null}

      <AppButton
        label={isSubmitting ? 'Saving…' : submitLabel}
        disabled={isSubmitting}
        onPress={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  switchRow: {
    minHeight: MinTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});