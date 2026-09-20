import type { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { bookingKeys } from '@/features/bookings/use-bookings';
import { executeAction } from '@/features/offline/execute-action';
import { seatKeys } from '@/features/seats/use-seats';
import { describeError } from '@/lib/describe-error';
import { selectIsOnline, useNetworkStore } from '@/lib/network';
import { findDependents, isPending, seatIdOf } from '@/lib/outbox';
import { useOutboxStore } from '@/store/outbox-store';
import type { OutboxItem } from '@/types';

let replaying = false;

/** Đánh dấu mục bị server từ chối, kèm các mục chờ phía sau phụ thuộc vào ghế đó. */
function reject(item: OutboxItem, error: unknown): void {
  const outbox = useOutboxStore.getState();
  const dependents = findDependents(outbox.items, item);
  outbox.markFailed(item.id, describeError(error));
  for (const dependent of dependents) {
    outbox.markFailed(
      dependent.id,
      `Skipped because an earlier change to seat ${seatIdOf(item.action)} was rejected.`,
    );
  }
}

/** Gửi lần lượt các mục đang chờ. An toàn khi gọi nhiều lần: chỉ một lượt chạy tại một thời điểm. */
export async function replayOutbox(queryClient: QueryClient): Promise<void> {
  if (replaying) {
    return;
  }
  replaying = true;
  let touchedSeats = false;
  let touchedBookings = false;

  try {
    for (;;) {
      if (!selectIsOnline(useNetworkStore.getState())) {
        break;
      }
      const next = useOutboxStore.getState().items.find(isPending);
      if (next === undefined) {
        break;
      }

      try {
        await executeAction(next.action);
        useOutboxStore.getState().remove(next.id);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'NETWORK') {
          break; // Lỗi tạm thời: giữ nguyên trạng thái chờ, thử lại khi có mạng.
        }
        reject(next, error);
      }

      if (next.action.type === 'createBooking') {
        touchedBookings = true;
      } else {
        touchedSeats = true;
      }
    }
  } finally {
    replaying = false;
  }

  // Thay dữ liệu tạm trong cache bằng dữ liệu thật của server.
  if (touchedSeats) {
    await queryClient.invalidateQueries({ queryKey: seatKeys.all });
  }
  if (touchedBookings) {
    await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
  }
}