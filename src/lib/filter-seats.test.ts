import { filterSeats, getZones } from '@/lib/filter-seats';
import type { Seat } from '@/types';

const seats: Seat[] = [
  { id: 'A01', zone: 'A', hasOutlet: true },
  { id: 'A02', zone: 'A', hasOutlet: false },
  { id: 'B01', zone: 'B', hasOutlet: true },
  { id: 'B02', zone: 'B', hasOutlet: false },
];

const ids = (list: Seat[]) => list.map((seat) => seat.id);

describe('filterSeats', () => {
  it('returns everything when no filter is set', () => {
    expect(ids(filterSeats(seats, '', null))).toEqual(['A01', 'A02', 'B01', 'B02']);
  });

  it('filters by zone', () => {
    expect(ids(filterSeats(seats, '', 'B'))).toEqual(['B01', 'B02']);
  });

  it('searches by id, ignoring case and surrounding spaces', () => {
    expect(ids(filterSeats(seats, '  a0 ', null))).toEqual(['A01', 'A02']);
    expect(ids(filterSeats(seats, '01', null))).toEqual(['A01', 'B01']);
  });

  it('requires both the zone and the search text to match', () => {
    expect(ids(filterSeats(seats, '02', 'A'))).toEqual(['A02']);
  });

  it('keeps only seats with an outlet when outletOnly is on', () => {
    expect(ids(filterSeats(seats, '', null, true))).toEqual(['A01', 'B01']);
  });

  it('combines the outlet filter with the other filters', () => {
    expect(ids(filterSeats(seats, '', 'B', true))).toEqual(['B01']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterSeats(seats, 'zzz', null)).toEqual([]);
  });
});

describe('getZones', () => {
  it('lists each zone once, sorted', () => {
    const shuffled: Seat[] = [seats[2], seats[0], seats[3], seats[1]];
    expect(getZones(shuffled)).toEqual(['A', 'B']);
  });
});