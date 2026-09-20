export type Seat = {
  id: string;
  zone: string;
  hasOutlet: boolean;
};

export type SeatInput = Omit<Seat, 'id'>;

/** Giờ dạng "HH:mm" (24 giờ), ví dụ "14:00". */
export type TimeSlot = {
  start: string;
  end: string;
};

export type Booking = {
  id: string;
  seatId: string;
  /** Ngày dạng "YYYY-MM-DD" theo giờ địa phương. */
  date: string;
  timeSlot: TimeSlot;
  studentName: string;
};

export type BookingInput = Omit<Booking, 'id'>;

export type User = {
  studentName: string;
};
export type OutboxAction =
  | { type: 'createSeat'; seat: Seat }
  | { type: 'updateSeat'; seatId: string; input: SeatInput }
  | { type: 'createBooking'; booking: BookingInput };

export type OutboxItem = {
  id: string;
  /** Thời điểm tạo (mili giây), dùng để sắp xếp. */
  createdAt: number;
  action: OutboxAction;
  /** Chỉ có giá trị khi server từ chối lúc phát lại. Không có nghĩa là đang chờ. */
  error?: string;
};