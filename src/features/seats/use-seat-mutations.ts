import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSeat, updateSeat } from '@/api/seats-api';
import { isOffline, queueOffline } from '@/features/offline/queue';
import { seatKeys } from '@/features/seats/use-seats';
import type { Seat, SeatInput } from '@/types';

export function useCreateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    // Trả về ghế đã tạo, hoặc null nếu thay đổi được xếp hàng đợi vì đang offline.
    mutationFn: async (seat: Seat): Promise<Seat | null> => {
      if (isOffline()) {
        queueOffline(queryClient, { type: 'createSeat', seat });
        return null;
      }
      return createSeat(seat);
    },
    onSuccess: (created) =>
      created === null ? undefined : queryClient.invalidateQueries({ queryKey: seatKeys.all }),
  });
}

export function useUpdateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SeatInput }): Promise<Seat | null> => {
      if (isOffline()) {
        queueOffline(queryClient, { type: 'updateSeat', seatId: id, input });
        return null;
      }
      return updateSeat(id, input);
    },
    onSuccess: (updated) =>
      updated === null ? undefined : queryClient.invalidateQueries({ queryKey: seatKeys.all }),
  });
}