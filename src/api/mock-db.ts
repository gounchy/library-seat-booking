import { toDateString } from '@/lib/time';
import type { Booking, Seat } from '@/types';

const ZONES = ['A', 'B', 'C'] as const;
const SEATS_PER_ZONE = 6;

type Database = {
  seats: Seat[];
  bookings: Booking[];
  nextBookingNumber: number;
};

function createSeedSeats(): Seat[] {
  return ZONES.flatMap((zone) =>
    Array.from({ length: SEATS_PER_ZONE }, (_, index) => ({
      id: `${zone}${String(index + 1).padStart(2, '0')}`,
      zone,
      hasOutlet: index % 2 === 0,
    })),
  );
}

function createSeedBookings(): Booking[] {
  const today = toDateString(new Date());
  return [
    { id: 'b1', seatId: 'A01', date: today, timeSlot: { start: '08:00', end: '12:00' }, studentName: 'Tran Van B' },
    { id: 'b2', seatId: 'A02', date: today, timeSlot: { start: '13:00', end: '17:00' }, studentName: 'Le Thi C' },
    { id: 'b3', seatId: 'B01', date: today, timeSlot: { start: '09:00', end: '18:00' }, studentName: 'Pham Van D' },
    { id: 'b4', seatId: 'B02', date: today, timeSlot: { start: '14:00', end: '16:00' }, studentName: 'Vo Thi E' },
  ];
}

/**
 * "Cơ sở dữ liệu" của server giả, nằm trong bộ nhớ.
 * Chỉ các file trong src/api được import file này. UI không được import trực tiếp.
 * Tắt hẳn app rồi mở lại thì dữ liệu về trạng thái ban đầu.
 */
export const db: Database = {
  seats: createSeedSeats(),
  bookings: createSeedBookings(),
  nextBookingNumber: 5,
};