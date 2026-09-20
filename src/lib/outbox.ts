import type { OutboxAction, OutboxItem } from '@/types';

export function isPending(item: OutboxItem): boolean {
  return item.error === undefined;
}

/** Ghế mà hành động này tác động tới. */
export function seatIdOf(action: OutboxAction): string {
  switch (action.type) {
    case 'createSeat':
      return action.seat.id;
    case 'updateSeat':
      return action.seatId;
    case 'createBooking':
      return action.booking.seatId;
  }
}

export function describeAction(action: OutboxAction): string {
  switch (action.type) {
    case 'createSeat':
      return `Create seat ${action.seat.id} in zone ${action.seat.zone}`;
    case 'updateSeat': {
      const outlet = action.input.hasOutlet ? 'with outlet' : 'without outlet';
      return `Update seat ${action.seatId}: zone ${action.input.zone}, ${outlet}`;
    }
    case 'createBooking': {
      const { seatId, date, timeSlot } = action.booking;
      return `Book seat ${seatId} on ${date}, ${timeSlot.start}-${timeSlot.end}`;
    }
  }
}

/**
 * Khi một thay đổi về GHẾ bị từ chối, các mục CHỜ phía sau về cùng ghế đó
 * cũng không nên chạy (ví dụ tạo ghế bị từ chối rồi sửa ghế cùng id).
 * Booking bị từ chối thì không kéo theo mục nào.
 */
export function findDependents(items: OutboxItem[], failed: OutboxItem): OutboxItem[] {
  if (failed.action.type === 'createBooking') {
    return [];
  }
  const seatId = seatIdOf(failed.action);
  const failedIndex = items.findIndex((item) => item.id === failed.id);
  return items.filter(
    (item, index) =>
      index > failedIndex && isPending(item) && seatIdOf(item.action) === seatId,
  );
}