import { compareBookings, isBookingActiveAt } from '@/lib/booking-time';
import type { Booking } from '@/types';

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  seatId: 'A01',
  date: '2026-09-19',
  timeSlot: { start: '14:00', end: '16:00' },
  studentName: 'Tran Van B',
  ...overrides,
});

const at = (hours: number, minutes: number) => new Date(2026, 8, 19, hours, minutes);

describe('isBookingActiveAt', () => {
  it('is active exactly at the start time', () => {
    expect(isBookingActiveAt(booking(), at(14, 0))).toBe(true);
  });

  it('is active one minute before the end', () => {
    expect(isBookingActiveAt(booking(), at(15, 59))).toBe(true);
  });

  it('is not active exactly at the end time', () => {
    expect(isBookingActiveAt(booking(), at(16, 0))).toBe(false);
  });

  it('is not active before the start time', () => {
    expect(isBookingActiveAt(booking(), at(13, 59))).toBe(false);
  });

  it('is not active on another date', () => {
    expect(isBookingActiveAt(booking({ date: '2026-09-20' }), at(15, 0))).toBe(false);
  });
});

describe('compareBookings', () => {
  it('sorts by date, then by start time', () => {
    const nextDay = booking({ id: 'x', date: '2026-09-20', timeSlot: { start: '08:00', end: '09:00' } });
    const afternoon = booking({ id: 'y' });
    const morning = booking({ id: 'z', timeSlot: { start: '08:00', end: '09:00' } });
    const sorted = [nextDay, afternoon, morning].sort(compareBookings);
    expect(sorted.map((b) => b.id)).toEqual(['z', 'y', 'x']);
  });
});