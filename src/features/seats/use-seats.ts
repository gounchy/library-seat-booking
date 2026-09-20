import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSeat, getSeat, getSeats, updateSeat } from '@/api/seats-api';
import type { Seat, SeatInput } from '@/types';

export const seatKeys = {
  all: ['seats'] as const,
  detail: (id: string) => ['seats', id] as const,
};

export function useSeats() {
  return useQuery({
    queryKey: seatKeys.all,
    queryFn: getSeats,
  });
}
export function useSeat(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: seatKeys.detail(id),
    queryFn: () => getSeat(id),
    // Nếu danh sách đã có ghế này, dùng nó làm dữ liệu ban đầu (hiện ngay, dùng được offline).
    initialData: () =>
      queryClient.getQueryData<Seat[]>(seatKeys.all)?.find((seat) => seat.id === id),
    // Dữ liệu ban đầu "già" bằng dữ liệu của danh sách, để TanStack biết khi nào cần tải lại.
    initialDataUpdatedAt: () => queryClient.getQueryState(seatKeys.all)?.dataUpdatedAt,
  });
}
export function useCreateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSeat, // (seat: Seat) => Promise<Seat>
    onSuccess: (seat) => {
      queryClient.setQueryData<Seat[]>(seatKeys.all, (old) => (old ? [...old, seat] : [seat]));
      queryClient.setQueryData(seatKeys.detail(seat.id), seat);
    },
  });
}

export function useUpdateSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SeatInput }) => updateSeat(id, input),
    onSuccess: (seat) => {
      queryClient.setQueryData<Seat[]>(seatKeys.all, (old) =>
        old ? old.map((s) => (s.id === seat.id ? seat : s)) : [seat],
      );
      queryClient.setQueryData(seatKeys.detail(seat.id), seat);
    },
  });
}