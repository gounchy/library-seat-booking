import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking } from '@/api/bookings-api';
import { bookingKeys } from '@/features/bookings/use-bookings';
import type { Booking, BookingInput } from '@/types';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingInput) => createBooking(input),
    onSuccess: (created) => {
      // 1. Cập nhật tức thì: ghép booking mới vào cache để giao diện đổi ngay.
      queryClient.setQueryData<Booking[]>(bookingKeys.all, (old) =>
        old ? [...old, created] : old,
      );
      // 2. Đối chiếu với server ở chế độ nền (không chờ, để form đóng ngay).
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}