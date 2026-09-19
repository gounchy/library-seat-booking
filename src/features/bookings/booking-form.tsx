


import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { describeError } from '@/lib/describe-error';
import { describeConflict, findConflict } from '@/lib/overlap';
import { toDateString } from '@/lib/time';
import { validateBooking } from '@/lib/validate-booking';
import type { Booking, TimeSlot } from '@/types';

export type BookingValues = { date: string; timeSlot: TimeSlot };

type BookingFormProps = {
  seatId: string;
  existingBookings: Booking[];
  isSubmitting: boolean;
  submitError: unknown;
  onSubmit: (values: BookingValues) => void;
};

export function BookingForm({
  seatId,
  existingBookings,
  isSubmitting,
  submitError,
  onSubmit,
}: BookingFormProps) {
  const today = toDateString(useNow());
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const values: BookingValues = {
    date: date.trim(),
    timeSlot: { start: start.trim(), end: end.trim() },
  };
  const rulesError = validateBooking(values, today);
  const conflict =
    rulesError === undefined ? findConflict(existingBookings, { seatId, ...values }) : undefined;
  const formError = rulesError ?? (conflict ? describeConflict(conflict) : undefined);

  let shownError: string | null = null;
  if (submitted && formError !== undefined) {
    shownError = formError;
  } else if (submitError) {
    shownError = describeError(submitError);
  }

  const handleSubmit = () => {
    setSubmitted(true);
    if (formError !== undefined) {
      return;
    }
    onSubmit(values);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <ThemedText type="smallBold">Date</ThemedText>
        <AppTextInput
          accessibilityLabel="Date, year-month-day"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          autoCorrect={false}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <ThemedText type="smallBold">Start time</ThemedText>
          <AppTextInput
            accessibilityLabel="Start time, hours and minutes"
            placeholder="14:00"
            value={start}
            onChangeText={setStart}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            autoCorrect={false}
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <ThemedText type="smallBold">End time</ThemedText>
          <AppTextInput
            accessibilityLabel="End time, hours and minutes"
            placeholder="16:00"
            value={end}
            onChangeText={setEnd}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            autoCorrect={false}
          />
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        Times use the 24-hour format (HH:mm). The end time is not included, so 14:00-16:00 and
        16:00-18:00 do not conflict.
      </ThemedText>

      {shownError !== null ? (
        <ThemedText themeColor="error" accessibilityRole="alert">
          {shownError}
        </ThemedText>
      ) : null}

      <AppButton
        label={isSubmitting ? 'Booking…' : 'Book seat'}
        disabled={isSubmitting}
        onPress={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  field: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
});


