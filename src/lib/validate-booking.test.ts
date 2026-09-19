import { validateBooking } from '@/lib/validate-booking';

const TODAY = '2026-09-19';
const slot = { start: '14:00', end: '16:00' };

describe('validateBooking', () => {
  it('accepts today with a valid slot', () => {
    expect(validateBooking({ date: TODAY, timeSlot: slot }, TODAY)).toBeUndefined();
  });

  it('accepts a future date', () => {
    expect(validateBooking({ date: '2026-09-20', timeSlot: slot }, TODAY)).toBeUndefined();
  });

  it('rejects a date in the past', () => {
    expect(validateBooking({ date: '2026-09-18', timeSlot: slot }, TODAY)).toBeDefined();
  });

  it('rejects a malformed date', () => {
    for (const bad of ['2026-9-19', '19/09/2026', 'abc', '']) {
      expect(validateBooking({ date: bad, timeSlot: slot }, TODAY)).toBeDefined();
    }
  });

  it('rejects a date that does not exist', () => {
    expect(validateBooking({ date: '2026-02-30', timeSlot: slot }, TODAY)).toBeDefined();
  });

  it('rejects an invalid time slot', () => {
    const backwards = { start: '16:00', end: '14:00' };
    expect(validateBooking({ date: TODAY, timeSlot: backwards }, TODAY)).toBeDefined();
  });
});