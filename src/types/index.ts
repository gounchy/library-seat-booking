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