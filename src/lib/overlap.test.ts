import { findConflict, hasConflict, overlaps, validateTimeSlot } from '@/lib/overlap';
import type { Booking, TimeSlot } from '@/types';

const slot = (start: string, end: string): TimeSlot => ({ start, end });

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  seatId: 'A01',
  date: '2026-09-19',
  timeSlot: slot('14:00', '16:00'),
  studentName: 'Tran Van B',
  ...overrides,
});

describe('overlaps', () => {
  it('detects a partial overlap (14:00-16:00 vs 15:00-17:00)', () => {
    expect(overlaps(slot('14:00', '16:00'), slot('15:00', '17:00'))).toBe(true);
    expect(overlaps(slot('15:00', '17:00'), slot('14:00', '16:00'))).toBe(true);
  });

  it('detects an exact duplicate', () => {
    expect(overlaps(slot('14:00', '16:00'), slot('14:00', '16:00'))).toBe(true);
  });

  it('allows back-to-back slots (14:00-16:00 vs 16:00-18:00)', () => {
    expect(overlaps(slot('14:00', '16:00'), slot('16:00', '18:00'))).toBe(false);
    expect(overlaps(slot('16:00', '18:00'), slot('14:00', '16:00'))).toBe(false);
  });

  it('detects one slot containing the other (14:00-18:00 vs 15:00-16:00)', () => {
    expect(overlaps(slot('14:00', '18:00'), slot('15:00', '16:00'))).toBe(true);
    expect(overlaps(slot('15:00', '16:00'), slot('14:00', '18:00'))).toBe(true);
  });

  it('detects a one-minute overlap', () => {
    expect(overlaps(slot('14:00', '16:01'), slot('16:00', '18:00'))).toBe(true);
    expect(overlaps(slot('16:00', '18:00'), slot('14:00', '16:01'))).toBe(true);
  });

  it('allows a one-minute gap', () => {
    expect(overlaps(slot('14:00', '15:59'), slot('16:00', '18:00'))).toBe(false);
    expect(overlaps(slot('16:00', '18:00'), slot('14:00', '15:59'))).toBe(false);
  });

  it('allows slots at completely different times of day', () => {
    expect(overlaps(slot('08:00', '10:00'), slot('14:00', '16:00'))).toBe(false);
  });
});

describe('hasConflict', () => {
  const existing = [booking()];

  it('flags the same seat, same date and overlapping time', () => {
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('15:00', '17:00') };
    expect(hasConflict(existing, candidate)).toBe(true);
  });

  it('ignores a different seat at the same time', () => {
    const candidate = { seatId: 'A02', date: '2026-09-19', timeSlot: slot('14:00', '16:00') };
    expect(hasConflict(existing, candidate)).toBe(false);
  });

  it('ignores the same seat on a different date', () => {
    const candidate = { seatId: 'A01', date: '2026-09-20', timeSlot: slot('14:00', '16:00') };
    expect(hasConflict(existing, candidate)).toBe(false);
  });

  it('allows a back-to-back booking on the same seat and date', () => {
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('16:00', '18:00') };
    expect(hasConflict(existing, candidate)).toBe(false);
  });

  it('returns false when there are no bookings', () => {
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('14:00', '16:00') };
    expect(hasConflict([], candidate)).toBe(false);
  });

  it('finds a conflict among several bookings', () => {
    const many = [
      booking({ id: 'b1', timeSlot: slot('08:00', '10:00') }),
      booking({ id: 'b2', seatId: 'B01' }),
      booking({ id: 'b3' }),
    ];
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('15:00', '17:00') };
    expect(hasConflict(many, candidate)).toBe(true);
  });
});

describe('findConflict', () => {
  it('returns the booking that conflicts', () => {
    const many = [booking({ id: 'b1', timeSlot: slot('08:00', '10:00') }), booking({ id: 'b3' })];
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('15:00', '17:00') };
    expect(findConflict(many, candidate)?.id).toBe('b3');
  });

  it('returns undefined when the slot is free', () => {
    const candidate = { seatId: 'A01', date: '2026-09-19', timeSlot: slot('16:00', '18:00') };
    expect(findConflict([booking()], candidate)).toBeUndefined();
  });
});

describe('validateTimeSlot', () => {
  it('accepts a valid slot', () => {
    expect(validateTimeSlot(slot('14:00', '16:00'))).toBeUndefined();
  });

  it('rejects a slot whose end equals its start', () => {
    expect(validateTimeSlot(slot('14:00', '14:00'))).toBeDefined();
  });

  it('rejects a slot whose end is before its start', () => {
    expect(validateTimeSlot(slot('16:00', '14:00'))).toBeDefined();
  });

  it('rejects malformed times', () => {
    for (const bad of ['abc', '25:00', '14:60', '9:00', '']) {
      expect(validateTimeSlot(slot(bad, '16:00'))).toBeDefined();
    }
  });
});