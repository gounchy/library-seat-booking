import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking } from '@/api/bookings-api';
import { bookingKeys } from '@/features/bookings/use-bookings';
import { isOffline, queueOffline } from '@/features/offline/queue';
import type { Booking, BookingInput } from '@/types';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    // Trả về booking đã tạo, hoặc null nếu được xếp hàng đợi vì đang offline.
    mutationFn: async (input: BookingInput): Promise<Booking | null> => {
      if (isOffline()) {
        queueOffline(queryClient, { type: 'createBooking', booking: input });
        return null;
      }
      return createBooking(input);
    },
    onSuccess: (created) => {
      if (created === null) {
        return; // Đã xếp hàng: cache đã được cập nhật tạm ở queueOffline.
      }
      // 1. Cập nhật tức thì để ghế hiện "taken" ngay.
      queryClient.setQueryData<Booking[]>(bookingKeys.all, (old) =>
        old ? [...old, created] : old,
      );
      // 2. Đối chiếu với server ở nền.
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}