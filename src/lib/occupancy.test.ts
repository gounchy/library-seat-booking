import { occupancyByZone, type ZoneOccupancy } from '@/lib/occupancy';
import type { Booking, Seat } from '@/types';

const seat = (id: string, zone: string): Seat => ({ id, zone, hasOutlet: false });

const booking = (
  seatId: string,
  start: string,
  end: string,
  overrides: Partial<Booking> = {},
): Booking => ({
  id: `b-${seatId}-${start}`,
  seatId,
  date: '2026-09-19',
  timeSlot: { start, end },
  studentName: 'Tran Van B',
  ...overrides,
});

const NOW = new Date(2026, 8, 19, 15, 0);

const seats = [
  seat('A01', 'A'),
  seat('A02', 'A'),
  seat('A03', 'A'),
  seat('A04', 'A'),
  seat('B01', 'B'),
  seat('B02', 'B'),
];

const zoneOf = (result: ZoneOccupancy[], zone: string) => result.find((z) => z.zone === zone);

describe('occupancyByZone', () => {
  it('is 0% when nobody has booked', () => {
    const result = occupancyByZone(seats, [], NOW);
    expect(zoneOf(result, 'A')).toEqual({ zone: 'A', total: 4, taken: 0, percent: 0 });
    expect(zoneOf(result, 'B')).toEqual({ zone: 'B', total: 2, taken: 0, percent: 0 });
  });

  it('is 50% when half of the zone is taken right now', () => {
    const bookings = [booking('A01', '14:00', '16:00'), booking('A02', '15:00', '17:00')];
    const result = occupancyByZone(seats, bookings, NOW);
    expect(zoneOf(result, 'A')).toEqual({ zone: 'A', total: 4, taken: 2, percent: 50 });
    expect(zoneOf(result, 'B')?.percent).toBe(0);
  });

  it('is 100% when every seat of the zone is taken', () => {
    const bookings = [booking('B01', '14:00', '16:00'), booking('B02', '14:00', '16:00')];
    expect(zoneOf(occupancyByZone(seats, bookings, NOW), 'B')?.percent).toBe(100);
  });

  it('counts a seat once even if two bookings cover now', () => {
    const bookings = [booking('A01', '14:00', '16:00'), booking('A01', '15:00', '17:00')];
    expect(zoneOf(occupancyByZone(seats, bookings, NOW), 'A')).toEqual({
      zone: 'A',
      total: 4,
      taken: 1,
      percent: 25,
    });
  });

  it('does not count a booking that ends exactly now', () => {
    const bookings = [booking('A01', '13:00', '15:00')];
    expect(zoneOf(occupancyByZone(seats, bookings, NOW), 'A')?.taken).toBe(0);
  });

  it('counts a booking that starts exactly now', () => {
    const bookings = [booking('A01', '15:00', '17:00')];
    expect(zoneOf(occupancyByZone(seats, bookings, NOW), 'A')?.taken).toBe(1);
  });

  it('ignores bookings on other dates', () => {
    const bookings = [booking('A01', '14:00', '16:00', { date: '2026-09-20' })];
    expect(zoneOf(occupancyByZone(seats, bookings, NOW), 'A')?.taken).toBe(0);
  });

  it('rounds the percentage', () => {
    const three = [seat('C01', 'C'), seat('C02', 'C'), seat('C03', 'C')];
    const one = [booking('C01', '14:00', '16:00')];
    const two = [booking('C01', '14:00', '16:00'), booking('C02', '14:00', '16:00')];
    expect(zoneOf(occupancyByZone(three, one, NOW), 'C')?.percent).toBe(33);
    expect(zoneOf(occupancyByZone(three, two, NOW), 'C')?.percent).toBe(67);
  });

  it('ignores bookings for seats that do not exist', () => {
    const bookings = [booking('Z99', '14:00', '16:00')];
    const result = occupancyByZone(seats, bookings, NOW);
    expect(result.map((z) => z.zone)).toEqual(['A', 'B']);
    expect(result.every((z) => z.taken === 0)).toBe(true);
  });

  it('groups by zone and sorts the zones alphabetically', () => {
    const mixed = [seat('B01', 'B'), seat('A01', 'A'), seat('B02', 'B')];
    expect(occupancyByZone(mixed, [], NOW).map((z) => z.zone)).toEqual(['A', 'B']);
  });

  it('returns nothing when there are no seats', () => {
    expect(occupancyByZone([], [booking('A01', '14:00', '16:00')], NOW)).toEqual([]);
  });
});