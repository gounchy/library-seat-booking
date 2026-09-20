import { describeAction, findDependents, isPending, seatIdOf } from '@/lib/outbox';
import type { BookingInput, OutboxAction, OutboxItem, Seat } from '@/types';

const seat = (id: string): Seat => ({ id, zone: 'E', hasOutlet: false });

const bookingInput = (seatId: string): BookingInput => ({
  seatId,
  date: '2026-09-19',
  timeSlot: { start: '14:00', end: '16:00' },
  studentName: 'Tran Van B',
});

const item = (id: string, action: OutboxAction, error?: string): OutboxItem => ({
  id,
  createdAt: 0,
  action,
  ...(error === undefined ? {} : { error }),
});

describe('outbox helpers', () => {
  it('finds the seat an action touches', () => {
    expect(seatIdOf({ type: 'createSeat', seat: seat('E01') })).toBe('E01');
    expect(
      seatIdOf({ type: 'updateSeat', seatId: 'E02', input: { zone: 'E', hasOutlet: true } }),
    ).toBe('E02');
    expect(seatIdOf({ type: 'createBooking', booking: bookingInput('E03') })).toBe('E03');
  });

  it('describes each kind of action', () => {
    expect(describeAction({ type: 'createSeat', seat: seat('E01') })).toBe(
      'Create seat E01 in zone E',
    );
    expect(
      describeAction({ type: 'updateSeat', seatId: 'E01', input: { zone: 'F', hasOutlet: true } }),
    ).toBe('Update seat E01: zone F, with outlet');
    expect(describeAction({ type: 'createBooking', booking: bookingInput('E01') })).toBe(
      'Book seat E01 on 2026-09-19, 14:00-16:00',
    );
  });

  it('treats an item as pending only when it has no error', () => {
    const action: OutboxAction = { type: 'createSeat', seat: seat('E01') };
    expect(isPending(item('1', action))).toBe(true);
    expect(isPending(item('1', action, 'Rejected'))).toBe(false);
  });
});

describe('findDependents', () => {
  const create = item('1', { type: 'createSeat', seat: seat('E01') });
  const update = item('2', {
    type: 'updateSeat',
    seatId: 'E01',
    input: { zone: 'E', hasOutlet: true },
  });
  const bookingSame = item('3', { type: 'createBooking', booking: bookingInput('E01') });
  const bookingOther = item('4', { type: 'createBooking', booking: bookingInput('A01') });
  const items = [create, update, bookingSame, bookingOther];

  it('returns later pending items for the same seat when a seat change fails', () => {
    expect(findDependents(items, create).map((i) => i.id)).toEqual(['2', '3']);
  });

  it('returns nothing when a booking fails', () => {
    expect(findDependents(items, bookingSame)).toEqual([]);
  });

  it('does not return earlier items', () => {
    expect(findDependents(items, update).map((i) => i.id)).toEqual(['3']);
  });

  it('skips items that have already failed', () => {
    const failedBooking = item(
      '3',
      { type: 'createBooking', booking: bookingInput('E01') },
      'Rejected',
    );
    expect(findDependents([create, update, failedBooking], create).map((i) => i.id)).toEqual([
      '2',
    ]);
  });
});