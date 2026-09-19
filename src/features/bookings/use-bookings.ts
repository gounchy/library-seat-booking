import { useQuery } from '@tanstack/react-query';

import { getBookings } from '@/api/bookings-api';

export const bookingKeys = {
  all: ['bookings'] as const,
};

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: getBookings,
  });
}