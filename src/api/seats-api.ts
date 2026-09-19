import { ApiError, simulateRequest } from '@/api/client';
import { db } from '@/api/mock-db';
import { validateSeatId, validateZone } from '@/lib/validate-seat';
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
    const validationError = validateSeatId(seat.id) ?? validateZone(seat.zone);
    if (validationError) {
      throw new ApiError('VALIDATION', validationError);
    }
    const id = seat.id.trim().toUpperCase();
    if (db.seats.some((s) => s.id === id)) {
      throw new ApiError('CONFLICT', `Seat ${id} already exists.`);
    }
    const created: Seat = { id, zone: seat.zone.trim(), hasOutlet: seat.hasOutlet };
    db.seats.push(created);
    return copySeat(created);
  });
}

export function updateSeat(id: string, input: SeatInput): Promise<Seat> {
  return simulateRequest(() => {
    const seat = findSeat(id);
    const validationError = validateZone(input.zone);
    if (validationError) {
      throw new ApiError('VALIDATION', validationError);
    }
    seat.zone = input.zone.trim();
    seat.hasOutlet = input.hasOutlet;
    return copySeat(seat);
  });
}