import type { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { applyToCache } from '@/features/offline/apply-to-cache';
import { seatKeys } from '@/features/seats/use-seats';
import { selectIsOnline, useNetworkStore } from '@/lib/network';
import { useOutboxStore } from '@/store/outbox-store';
import type { OutboxAction, Seat } from '@/types';

export function isOffline(): boolean {
  return !selectIsOnline(useNetworkStore.getState());
}

/** Chuẩn hoá giống server, và chặn ngay ghế trùng id với dữ liệu đang có trong cache. */
function prepare(queryClient: QueryClient, action: OutboxAction): OutboxAction {
  if (action.type !== 'createSeat') {
    return action;
  }
  const id = action.seat.id.trim().toUpperCase();
  const known = queryClient.getQueryData<Seat[]>(seatKeys.all);
  if (known?.some((seat) => seat.id === id)) {
    throw new ApiError('CONFLICT', `Seat ${id} already exists.`);
  }
  return {
    type: 'createSeat',
    seat: { id, zone: action.seat.zone.trim(), hasOutlet: action.seat.hasOutlet },
  };
}

/** Ghi thay đổi vào outbox (bền vững) và cập nhật cache để giao diện thấy ngay. */
export function queueOffline(queryClient: QueryClient, action: OutboxAction): void {
  const item = useOutboxStore.getState().enqueue(prepare(queryClient, action));
  applyToCache(queryClient, item);
}