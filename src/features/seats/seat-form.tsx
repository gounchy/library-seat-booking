import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { describeError } from '@/lib/describe-error';
import type { Seat, SeatInput } from '@/types';

type SeatFormProps = {
  initialSeat?: Seat;
  idEditable: boolean;
  onSubmit: (values: { id: string; input: SeatInput }) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitError?: unknown;
};

export function SeatForm({
  initialSeat,
  idEditable,
  onSubmit,
  isSubmitting,
  submitLabel,
  submitError,
}: SeatFormProps) {
  const [id, setId] = useState(initialSeat?.id ?? '');
  const [zone, setZone] = useState(initialSeat?.zone ?? '');
  const [hasOutlet, setHasOutlet] = useState(initialSeat?.hasOutlet ?? false);
  const [touched, setTouched] = useState(false);

  const idError = idEditable && id.trim().length === 0 ? 'Seat id is required' : undefined;
  const zoneError = zone.trim().length === 0 ? 'Zone is required' : undefined;

  const handleSubmit = () => {
    setTouched(true);
    if (idError || zoneError) return;
    onSubmit({ id: id.trim(), input: { zone: zone.trim(), hasOutlet } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Seat ID</ThemedText>
        <AppTextInput
          accessibilityLabel="Seat ID"
          value={id}
          onChangeText={setId}
          editable={idEditable}
          placeholder="e.g. A01"
          autoCapitalize="characters"
        />
        {touched && idError ? (
          <ThemedText type="small" themeColor="error">
            {idError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Zone</ThemedText>
        <AppTextInput
          accessibilityLabel="Zone"
          value={zone}
          onChangeText={setZone}
          placeholder="e.g. A"
        />
        {touched && zoneError ? (
          <ThemedText type="small" themeColor="error">
            {zoneError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.switchRow}>
        <ThemedText type="smallBold">Has power outlet</ThemedText>
        <Switch
          value={hasOutlet}
          onValueChange={setHasOutlet}
          accessibilityRole="switch"
          accessibilityLabel="Has power outlet"
        />
      </View>

      {submitError ? (
        <ThemedText type="small" themeColor="error">
          {describeError(submitError)}
        </ThemedText>
      ) : null}

      <AppButton
        label={isSubmitting ? 'Saving…' : submitLabel}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  field: { gap: Spacing.one },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
});