import { validateTimeSlot } from '@/lib/overlap';
import { isValidDate } from '@/lib/time';
import type { Booking } from '@/types';

/**
 * Kiểm tra ngày và khung giờ. `today` truyền từ ngoài (dạng "YYYY-MM-DD")
 * để hàm không tự đọc đồng hồ, dễ test.
 * Trả về thông báo lỗi, hoặc undefined nếu hợp lệ.
 */
export function validateBooking(
  input: Pick<Booking, 'date' | 'timeSlot'>,
  today: string,
): string | undefined {
  if (!isValidDate(input.date)) {
    return 'Enter the date as YYYY-MM-DD, for example 2026-09-19.';
  }
  if (input.date < today) {
    return 'You cannot book a date in the past.';
  }
  return validateTimeSlot(input.timeSlot);
}