import { useQuery } from '@tanstack/react-query';

import { getSeats } from '@/api/seats-api';

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