const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Kiểm tra chuỗi có đúng dạng "HH:mm" (00:00 đến 23:59) không. */
export function isValidTime(time: string): boolean {
  return TIME_PATTERN.test(time);
}

/** "14:30" -> 870 (số phút tính từ 00:00). Chỉ gọi khi isValidTime(time) đúng. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Số phút tính từ 00:00 của một thời điểm, theo giờ địa phương. */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Date -> "YYYY-MM-DD" theo giờ địa phương. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}