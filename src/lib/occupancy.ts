import { isBookingActiveAt } from '@/lib/booking-time';
import type { Booking, Seat } from '@/types';

export type ZoneOccupancy = {
  zone: string;
  total: number;
  taken: number;
  /** 0 đến 100, làm tròn. Luôn tính từ total và taken, không lưu ở đâu cả. */
  percent: number;
};

export function occupancyByZone(seats: Seat[], bookings: Booking[], now: Date): ZoneOccupancy[] {
  const takenSeatIds = new Set(
    bookings.filter((booking) => isBookingActiveAt(booking, now)).map((booking) => booking.seatId),
  );

  const counts = new Map<string, { total: number; taken: number }>();
  for (const seat of seats) {
    const entry = counts.get(seat.zone) ?? { total: 0, taken: 0 };
    entry.total += 1;
    if (takenSeatIds.has(seat.id)) {
      entry.taken += 1;
    }
    counts.set(seat.zone, entry);
  }

  return [...counts.entries()]
    .map(([zone, { total, taken }]) => ({
      zone,
      total,
      taken,
      // total luôn >= 1 vì zone chỉ xuất hiện khi có ít nhất một ghế thuộc zone đó.
      percent: Math.round((taken / total) * 100),
    }))
    .sort((a, b) => a.zone.localeCompare(b.zone));
}