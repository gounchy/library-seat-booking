import { simulateRequest } from '@/api/client';
import { db } from '@/api/mock-db';
import type { Booking } from '@/types';

const copyBooking = (booking: Booking): Booking => ({
  ...booking,
  timeSlot: { ...booking.timeSlot },
});

export function getBookings(): Promise<Booking[]> {
  return simulateRequest(() => db.bookings.map(copyBooking));
}