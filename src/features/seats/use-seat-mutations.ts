import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSeat, updateSeat } from '@/api/seats-api';
import { seatKeys } from '@/features/seats/use-seats';
import type { Seat, SeatInput } from '@/types';

export function useCreateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seat: Seat) => createSeat(seat),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: seatKeys.all }),
  });
}

export function useUpdateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SeatInput }) => updateSeat(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: seatKeys.all }),
  });
}