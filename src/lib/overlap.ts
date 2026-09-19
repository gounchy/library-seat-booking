import { isValidTime, toMinutes } from '@/lib/time';
import type { Booking, TimeSlot } from '@/types';

type BookingCandidate = Pick<Booking, 'seatId' | 'date' | 'timeSlot'>;

/** Trả về thông báo lỗi nếu khung giờ không hợp lệ, hoặc undefined nếu hợp lệ. */
export function validateTimeSlot(slot: TimeSlot): string | undefined {
  if (!isValidTime(slot.start) || !isValidTime(slot.end)) {
    return 'Enter times as HH:mm, for example 14:00.';
  }
  if (toMinutes(slot.start) >= toMinutes(slot.end)) {
    return 'End time must be later than start time.';
  }
  return undefined;
}

/**
 * Hai khung giờ có chồng nhau không? Giờ kết thúc là loại trừ.
 * Chỉ gọi với khung giờ đã qua validateTimeSlot.
 */
export function overlaps(a: TimeSlot, b: TimeSlot): boolean {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

/** Booking đã có mà xung đột với booking mới (cùng ghế, cùng ngày, giờ chồng nhau). */
export function findConflict(
  existing: Booking[],
  candidate: BookingCandidate,
): Booking | undefined {
  return existing.find(
    (booking) =>
      booking.seatId === candidate.seatId &&
      booking.date === candidate.date &&
      overlaps(booking.timeSlot, candidate.timeSlot),
  );
}

export function hasConflict(existing: Booking[], candidate: BookingCandidate): boolean {
  return findConflict(existing, candidate) !== undefined;
}
export function describeConflict(booking: Booking): string {
  return `Seat ${booking.seatId} is already booked from ${booking.timeSlot.start} to ${booking.timeSlot.end} on ${booking.date}.`;
}