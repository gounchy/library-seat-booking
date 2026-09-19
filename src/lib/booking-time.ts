import { minutesOfDay, toDateString, toMinutes } from '@/lib/time';
import type { Booking } from '@/types';

/** Booking có bao phủ thời điểm `now` không? Giờ kết thúc là loại trừ: start <= now < end. */
export function isBookingActiveAt(booking: Booking, now: Date): boolean {
  if (booking.date !== toDateString(now)) {
    return false;
  }
  const minutes = minutesOfDay(now);
  return (
    toMinutes(booking.timeSlot.start) <= minutes && minutes < toMinutes(booking.timeSlot.end)
  );
}

/** So sánh để sắp xếp theo ngày rồi theo giờ bắt đầu ("YYYY-MM-DD" và "HH:mm" so sánh chuỗi được). */
export function compareBookings(a: Booking, b: Booking): number {
  return a.date.localeCompare(b.date) || a.timeSlot.start.localeCompare(b.timeSlot.start);
}