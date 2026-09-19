import { isValidTime, minutesOfDay, toDateString, toMinutes } from '@/lib/time';

describe('time helpers', () => {
  it('converts HH:mm to minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('14:00')).toBe(840);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('validates the HH:mm format', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('9:00')).toBe(false);
    expect(isValidTime('14:60')).toBe(false);
  });

  it('reads the local minutes of the day', () => {
    expect(minutesOfDay(new Date(2026, 8, 19, 14, 30))).toBe(870);
  });

  it('formats the local date, not the UTC date', () => {
    expect(toDateString(new Date(2026, 8, 19, 0, 30))).toBe('2026-09-19');
  });

  it('pads month and day with zeros', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});