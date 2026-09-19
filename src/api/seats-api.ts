import { ApiError, simulateRequest } from '@/api/client';
import { db } from '@/api/mock-db';
import type { Seat, SeatInput } from '@/types';

const copySeat = (seat: Seat): Seat => ({ ...seat });

function findSeat(id: string): Seat {
  const seat = db.seats.find((s) => s.id === id);
  if (!seat) {
    throw new ApiError('NOT_FOUND', `Seat ${id} not found.`);
  }
  return seat;
}

export function getSeats(): Promise<Seat[]> {
  return simulateRequest(() => db.seats.map(copySeat));
}

export function getSeat(id: string): Promise<Seat> {
  return simulateRequest(() => copySeat(findSeat(id)));
}

export function createSeat(seat: Seat): Promise<Seat> {
  return simulateRequest(() => {
    const id = seat.id.trim().toUpperCase();
    const zone = seat.zone.trim();
    if (!id || !zone) {
      throw new ApiError('VALIDATION', 'Seat id and zone are required.');
    }
    if (db.seats.some((s) => s.id === id)) {
      throw new ApiError('CONFLICT', `Seat ${id} already exists.`);
    }
    const created: Seat = { id, zone, hasOutlet: seat.hasOutlet };
    db.seats.push(created);
    return copySeat(created);
  });
}

export function updateSeat(id: string, input: SeatInput): Promise<Seat> {
  return simulateRequest(() => {
    const seat = findSeat(id);
    const zone = input.zone.trim();
    if (!zone) {
      throw new ApiError('VALIDATION', 'Zone is required.');
    }
    seat.zone = zone;
    seat.hasOutlet = input.hasOutlet;
    return copySeat(seat);
  });
}