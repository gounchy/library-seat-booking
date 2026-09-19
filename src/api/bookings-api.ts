import { ApiError, simulateRequest } from '@/api/client';
import { db } from '@/api/mock-db';
import { describeConflict, findConflict } from '@/lib/overlap';
import { toDateString } from '@/lib/time';
import { validateBooking } from '@/lib/validate-booking';
import type { Booking, BookingInput } from '@/types';

const copyBooking = (booking: Booking): Booking => ({
  ...booking,
  timeSlot: { ...booking.timeSlot },
});

export function getBookings(): Promise<Booking[]> {
  return simulateRequest(() => db.bookings.map(copyBooking));
}

export function createBooking(input: BookingInput): Promise<Booking> {
  return simulateRequest(() => {
    if (!db.seats.some((seat) => seat.id === input.seatId)) {
      throw new ApiError('NOT_FOUND', `Seat ${input.seatId} not found.`);
    }
    if (input.studentName.trim() === '') {
      throw new ApiError('VALIDATION', 'Student name is required.');
    }
    const rulesError = validateBooking(input, toDateString(new Date()));
    if (rulesError) {
      throw new ApiError('VALIDATION', rulesError);
    }
    // Lớp bảo vệ cuối cùng: kiểm tra trên dữ liệu THẬT của server, không tin cache của client.
    const conflict = findConflict(db.bookings, input);
    if (conflict) {
      throw new ApiError('CONFLICT', describeConflict(conflict));
    }

    const created: Booking = {
      id: `b${db.nextBookingNumber}`,
      seatId: input.seatId,
      date: input.date,
      timeSlot: { ...input.timeSlot },
      studentName: input.studentName.trim(),
    };
    db.nextBookingNumber += 1;
    db.bookings.push(created);
    return copyBooking(created);
  });
}